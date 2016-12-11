************
Introduction
************

Ce module NodeJS indique le dernier tarif EDF disponible pour l'option indiquée (base, hc ou tempo) et l'intensité souscrite.

Les données sont tirées du site developpement-durable.bscom.fr.

Une seule methode est disponible, la methode 'current'. Elle renvoie un objet JSON qui contient : 
* le dernier mois pour lequel un tarif est disponible
* le prix de l'abonnement annuel pour l'option et l'intensité souscrite choisie
* le prix des différents tarifs pour 100kWh pour l'option et l'intensité souscrite choisie

Exemple :

.. code
  {"MONTH":"nov-16","ABO":56.0686,"BASE":15.6435}
  {"MONTH":"nov-16","ABO":100.5141,"HCHP":15.5955,"HCHC":12.7035}
  {"MONTH":"nov-16","ABO":597.2093,"BBRHCJB":10.7475,"BBRHPJB":12.7755,"BBRHCJW":13.9995,"BBRHPJW":16.7355,"BBRHCJR":21.6075,"BBRHPJR":52.1595}


***********
Utilisation
***********

.. code: javascript

  var TarifEDF   = require( 'tarifedf' );
  var monContrat = new TarifEDF({ 'option' : 'base', 'isousc' : 6 });

  monContrat.current(function( err, data) { 
    if( err ) { console.error( err ); process.exit( -1 );}
    console.log( JSON.stringify( data ) );
  });

