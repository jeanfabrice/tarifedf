var request     = require( 'request' );
var _           = require( 'underscore' );
var xml         = require( 'xml' );
var parseString = require( 'xml2js' ).parseString;

var reportId = {
  'base'  : 13922,
  'hc'    : 13926,
  'tempo' : 13928
}

var refTarif = {
  'base' : {
    indexLibelleAbo: {
      '3': 0,
      '6': 1,
      '9': 2,
      '12': 3,
      '15': 4,
      '18': 5
    },
    indexLibelleTarif: {
      '3' : 6,
      '6' : 7,
      '9' : 8,
      '12' : 8,
      '15' : 8,
      '18' : 8
    }
  }, 
  'hc' : {
    indexLibelleAbo: {
      '6': 0,
      '9': 1,
      '12': 2,
      '15': 3,
      '18': 4,
      '24': 5,
      '30': 6,
      '36': 7
    },
    indexLibelleTarif: {
      'HCHP' : 8,
      'HCHC' : 9
    }
  },
  'tempo' : {
    indexLibelleAbo: {
      '9': 0,
      '12': 1,
      '30': 2,
      '36': 3
    },
    indexLibelleTarif: {
      'BBRHCJB' : 4,
      'BBRHPJB' : 5,
      'BBRHCJW' : 6,
      'BBRHPJW' : 7,
      'BBRHCJR' : 8,
      'BBRHPJR' : 9
    }
  }
}

var baseUrl = 'http://developpement-durable.bsocom.fr'
var uri     = '/Statistiques/TableViewer/getData.aspx'
var qs      = { 'row': 1, 'col': 1, 'rowCount': 100, 'colCount': 10 };
var headers = { 'User-Agent': 'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:50.0) Gecko/20100101 Firefox/50.0' }
var indexes = [];

function sortIndexes( a, b ) {
  if( a.index < b.index ) { return -1;}
  if( a.index > b.index ) { return 1;}
  return 0;
}

function buildXmlReq( libelle ) {
  var d      = new Date();
  var p      = ( d.getFullYear() - 1980 ) * 12 + d.getMonth();
  var period = [ p-1, p ].join( ',' );

  var xmlTemplate = { 
    'ReportView': [{
      'RowDims': [{
        'Dim': [{
          '_attr': {
            'name': 'Libelle'
          }
        }, {
          'Groups': [{
            'Group': [{
              '_attr': {
                'id': 1, 'type': 'Selection'
              }
            }, {
              'Definition' : [{
                'Items' : [{
                  '_attr' : {
                    'type': 'handles'
                  }
                }, {
                  'String': [{
                    '_attr': {
                      'value': libelle
                    }
                  }]
                }]

              }]
            }]
          }]
        }]
      }]
    }, {
      'ColDims': [{
        'Dim': [{
          '_attr': {
            'name': 'Période'
          }
        }, {
          'Groups': [{
            'Group': [{
              '_attr': {
                'id': 1, 'type': 'Selection'
              }
            }, {
              'Definition' : [{
                'Items' : [{
                  '_attr' : {
                    'type': 'handles'
                  }
                }, {
                  'String': [{
                    '_attr': {
                      'value': period
                    }
                  }]
                }]
              }]
            }
            ]
          }]
        }]
      }]
    }, {
      'OtherDims': [{
        'Dim': [{
          '_attr': {
            'name': 'Unités'
          }
        }, {
          'DimLangs': {}
        }]
      }]
    }]
  }
  return xml( xmlTemplate )
}

var Tarif = function( abo ) {
  if( reportId[ abo.option ] === undefined ) {
    throw new Error( "Option d'abonnement inexistante" );
  }
  if( refTarif[ abo.option ].indexLibelleAbo[ abo.isousc ] === undefined ) {
    throw new Error( "Intensité souscrite inexistante pour cette option." );
  }
  this.option = abo.option;
  this.isousc = abo.isousc;
  indexes.push({ 'name': 'ABO', 'index': refTarif[ abo.option ].indexLibelleAbo[ abo.isousc ], 'prix': 0 });
  switch( this.option ) {
    case 'base' :
      indexes.push({ 'name': 'BASE', 'index': refTarif[ abo.option ].indexLibelleTarif[ abo.isousc], 'prix': 0 });
    break;
    case 'hc' :
    case 'tempo' :
      _.each( refTarif[ abo.option ].indexLibelleTarif, function( v, k ) {
        indexes.push( { 'name': k, 'index': v, 'prix': 0 } );
      })
    break;
  }
  indexes.sort( sortIndexes );
}

Tarif.prototype.current = function( callback ) {
  var libelle = _.map( indexes, function( v ) { return v.index; });
  var form    = {
    'sWD_ReportId':   reportId[ this.option ],
    'sWD_ReportView': buildXmlReq( libelle.join( ',' ))
  }
  request({
    'method': 'post',
    'baseUrl': baseUrl,
    'uri'    : uri,
    'qs'     : qs,
    'form'   : form,
    'headers': headers
  }, function( error, response, body ) {
    if( !error && response.statusCode == 200 ) {
      var month;
      parseString( body, function( err, result ) {
        month = result.CubeView.Data[ 0 ].Headers[ 0 ].ColHeader[ 0 ].ColDim[ 0 ].ColLabels[ 0 ].ColLabel.slice( -1 )[ 0 ]._;
        _.each( result.CubeView.Data[ 0 ].Rows[ 0 ].Row, function( r, i ) {
          indexes[i].prix = r.Cells[ 0 ].C.slice( -1 )[ 0 ].$.v;
        })
      })
      var data = { 'MONTH': month }
      _.each( indexes, function( e ) {
        data[ e.name ] = parseFloat( e.prix );
      })
      callback( null, data );
    }
    else {
      callback( error, response );
    }
  })
}

module.exports= Tarif
