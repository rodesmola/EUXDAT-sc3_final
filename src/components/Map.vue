<template style="overflow: hidden">
<!-- eslint-disable vue/no-use-v-if-with-v-for,vue/no-confusing-v-for-v-if -->

  <v-container fluid grid-list-md fill-height style="padding: 0px;">
    <v-layout row wrap style="padding: 0px;">

      <v-flex fill-height ma-0 pa-0>
        <!------------ Start dialog ------------>
        <v-dialog v-model="startDialog" max-width="800">
          <v-card>
            <v-card-title class="headline">
                <img style="width: 155px;" src="../assets/logo_titulo.png" alt="">
            </v-card-title>

            <v-divider></v-divider>
              <StartDialog/>
            <v-divider></v-divider>

            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn color="green darken-1" dark small @click="startDialog = false">
                Got it!
              </v-btn>
             </v-card-actions>
           </v-card>
        </v-dialog>
        <!------------ Start dialog end ------------>

        <v-toolbar color="white" xs12 tabs  height="58px" style="position: absolute; z-index: 10; border-bottom: 4px solid #098837 !important;">
          <v-toolbar-title>
            <img style="width: 140px;" src="http://www.euxdat.eu/wp-content/uploads/2017/12/logo_1-1.png" alt="">
          </v-toolbar-title>
          <v-spacer></v-spacer>
          <span style="color:#27304c">
            <v-icon>person</v-icon> <span v-if="!$vuetify.breakpoint.smAndDown">{{user.name}}</span>
          </span>
          <v-btn icon title="Exit app" @click="logout()">
            <v-icon color="#27304c">exit_to_app</v-icon>
          </v-btn>
        </v-toolbar>


        <v-flex id="map" style="max-height: 100vh; height: 100vh; padding: 0px; margin: 0px;">



          <!------------ Service form start ------------>
          <div class="flex xs12 sm5 md3 lg3 xl2" style="position: absolute; z-index: 10; top:80px; left: 10px; background-color: #27304c;">
            <v-toolbar class="green" tabs  height="42px">
              <v-toolbar-title>
                <img style="width: 30px;" src="../assets/logo_1-1.png" alt="">
                <span style="font-size: 18px; margin-left: 5px;">Agroclimatic zones</span>
              </v-toolbar-title>

              <v-spacer></v-spacer>
              <v-btn icon @click="startDialog = true" title="More info">
                <v-icon color="#27304c">info</v-icon>
              </v-btn>

            </v-toolbar>

            <div style="background-color: white; padding-left: 10px; padding-right: 10px;">

              <v-form ref="form" v-model="isValid" style="margin-top: 10px; margin-bottom: 5px; text-size: 10px;" lazy-validation >
                <v-layout row wrap style="text-align: left; padding-top: 8px; padding-bottom: 8px;">
                  <AgroclimaticZones/>
                </v-layout>
              </v-form>

            </div>
          </div>
          <!------------/Service form------------>

          <!------------ Zoom controls and layer manager start ------------>
          <div class="flex xs12 sm4 md3 lg2" style="position: absolute; z-index: 10; top:80px; right: 10px;">
            <v-layout row wrap>
              <v-flex xs12 pl-2 row>

                <v-btn-toggle multiple>
                  <v-btn flat class="v-btn--active" title="Zoom in" @click="zoomMap(map, 'in')" style="background-color: #47a34b; color: white;">
                    <v-icon>add</v-icon>
                  </v-btn>
                  <v-btn flat class="v-btn--active" title="Zoom out" @click="zoomMap(map, 'out')" style="background-color: #47a34b; color: white;">
                    <v-icon>remove</v-icon>
                  </v-btn>
                </v-btn-toggle>

                <div class="" style="background-color: white; padding-left: 10px; padding-right: 10px;">
                  <v-radio-group v-model="selectedBaseLayer" :mandatory="false" v-on:change="setLayerVisibility()" style="padding-top: 14px;">
                    <v-radio color="#47a34b" label="Open Street Map" value="osm"></v-radio>
                    <v-radio color="#47a34b" label="Aerial" value="aerial" ></v-radio>
                  </v-radio-group>
                </div>

              </v-flex>
            </v-layout>
          </div>
          <!------------ Zoom controls and layer manager end ------------>

          <!------------ Output panel start ------------>
          
          <v-flex xs12 sm2 md2 lg2 v-if="outputPanel" style="position: absolute; z-index: 10; top:260px; right: 10px; max-height: 350px">
            <v-flex xlg4 offset-xlg8 lg9 offset-lg3 md12 sm12 style=" background-color: #27304c;">
              <v-toolbar class="green pa-0 ma-0" tabs height="35px" style="padding:0px;">
                <v-toolbar-title class="pa-0 ma-0">

                  <v-btn icon class="ma-0" title="Download GeoJSON" @click="downloadGeoJSON()">
                    <v-icon color="#27304c">archive</v-icon>
                  </v-btn>

                  <span style="color:#27304c; font-size: 16px;">
                    Outputs
                  </span>
                </v-toolbar-title>
                <v-spacer></v-spacer>
                <v-btn icon title="Close output panel" @click="outputPanel = false">
                  <v-icon color="#27304c">clear</v-icon>
                </v-btn>
                
              </v-toolbar>

              <div style="background-color: white; padding-left: 10px; padding-right: 10px; padding-bottom: 10px; margin-top: 5px; height: 400px; overflow-y: scroll;">
                <v-layout row wrap style="margin-top: 5px;">

                  <v-flex xs12 row v-for="(value, key) in outputData" v-bind:key="value + 1"  style="padding-top: 5px; padding-bottom: 5px; ">
                    <span v-if="key != 'geometry'">
                      <v-layout row wrap style="font-size: 12px; ">
                      <v-flex xs6 sm6>                     
                        <span class="caption grey--text" style="margin-right: 4px;">{{ key }}: </span>                            
                      </v-flex>
                      <v-flex xs6 sm6 style="text-align: right;">
                          {{ value }}
                      </v-flex>
                        </v-layout>
                    </span>
                  </v-flex>

                </v-layout>
              </div>
            </v-flex>
          </v-flex> 
          <!------------ Output panel end ------------>          

          <!------------ Alert start ------------>
          <div class="flex xs3" style="left: 10px; bottom: 10px; position: absolute; z-index: 10;" >
            <v-alert :value="isAlert" :type="alertType" dismissible transition="scale-transition">
               {{alertMsg}}
            </v-alert>
          </div>
          <!------------ Alert end ------------>

        </v-flex>
      </v-flex>

    </v-layout>
  </v-container>

</template>

<script>

import Map from 'ol/Map.js';
import View from 'ol/View.js';
import {Tile as TileLayer, Vector as VectorLayer} from 'ol/layer.js';
import {Vector as VectorSource} from 'ol/source.js'
import {Fill, Stroke, Style} from 'ol/style.js';
import {Select} from 'ol/interaction.js';
import moment from 'moment';
import OSM from 'ol/source/OSM';
import BingMaps from 'ol/source/BingMaps.js';

import StartDialog from '@/components/StartDialog.vue'
import AgroclimaticZones from '@/components/AgroclimaticZones.vue'


export default {
  name: 'Map',
  components: {
    StartDialog,
    AgroclimaticZones,
  },
  data: () => ({
    startDialog: true,
    selectedBaseLayer: 'osm',
    isValid: false,
    isAlert: false,
    alertMsg: "",
    alertType: "error",
    isLoading: false,
    outputPanel: false,
    outputData: {},
    downloadURL: ""
  }),
  methods: {    
    initMap() {

      var defaultStyle = new Style({
        stroke: new Stroke({
          color: '#3994bd',
          width: 2
        }),
        fill: new Fill({
          color: 'rgba(0, 0, 0, 0)'
        })
      });

      //Aerial layer
      var aerialLayer =  new TileLayer({
        visible: false,
        preload: Infinity,
        name: 'aerial',
        source: new BingMaps({
          key: 'AgbuLm2QSg5-rZyOrydftTOzC7z5pYY82q4By3PgFoKhPxNSrrcf1JFs1yoJXJIp',
          imagerySet: 'Aerial',
          maxZoom: 19
        })
      });

      //OSM layer
      var osm = new TileLayer({
        name: 'osm',
        source: new OSM()
      })
      osm.setVisible(true);

      var drawLayer = new VectorLayer({
        source: new VectorSource(),
        name: 'userPolygonsLayer',
        style: defaultStyle
      });
      drawLayer.setZIndex(99)

      var myMap = new Map({
        target: 'map',
        layers: [
          aerialLayer,
          drawLayer,
          osm
        ],
        view: new View({
          projection: 'EPSG:4326', 
          //center: [1707623.578894, 6432139.245285], 
          //extent: [1525291.697819, 6335895.825063, 1865993.003313, 6555524.926847],
          center: [15.018311, 50.187451], // [12.14, 48.51]
          extent: [13.426942, 49.2130265, 16.9025003, 50.6266995], //[1525291.697819, 6335895.825063, 1865993.003313, 6555524.926847],          
          zoom: 9,
          minZoom: 8,
        })
      });

      this.map = myMap;
      this.$store.state.map = myMap;

    },//initMap
    /**
    * zoom map controls
    *
    * @param {object} map
    * @param {string} op
    * @public
    */
    zoomMap(map, op){
      var zoom = map.getView().getZoom();

      if(op === "in"){
        map.getView().setZoom(zoom + 1)
      }else{
        map.getView().setZoom(zoom - 1)
      }
    },//zoomInMap
    /**
    * Controls the base layers visibility
    *
    * @public
    */
    setLayerVisibility(){
      var self = this;
      if(this.selectedBaseLayer === 'osm'){
        self.getLayerFromMapByName('aerial').setVisible(false);
        self.getLayerFromMapByName('osm').setVisible(true);
      }else{
        self.getLayerFromMapByName('aerial').setVisible(true);
        self.getLayerFromMapByName('osm').setVisible(false);
      }
    },//setLayerVisibility
    /**
    * Get the map layer by name and return it as a OL layer object
    *        
    * @param {string} name
    * @return {object}
    * @public
    */
    getLayerFromMapByName(name){
      var layer;
      this.$store.state.map.getLayers().forEach(function(lyr) {
        if(lyr.get('name') === name){
          layer = lyr;
        }
      });
      return layer;
    },//getLayerFromMapByName      
    showOutput(bool, url){
      var self = this;
      this.downloadURL = url;

      if(bool){

        var interactionSelect = new Select({
          layers:[this.getLayerFromMapByName('output')]
        });
        this.$store.state.map.addInteraction(interactionSelect);

        this.$store.state.interactionSelect = interactionSelect;

        interactionSelect.on('select', function(e) {
          e.target.getFeatures().forEach(function(f){

            if(!f.getProperties().culture){
              self.outputData = f.getProperties();            
              self.outputPanel = true;            
            }//else{
              //f.setStyle(self.defaultStyle);
            //}
          })
        });

      }else{
        this.outputPanel = false; 
      }
    },
    /**
    * Open a new tab in the explorer to download the output
    *
    * @public
    */
    downloadGeoJSON(){
      window.open(this.downloadURL, '_blank');
    },//downloadGeoJSON    
    /**
    * Create an alert with custom message
    *
    * @param {string} type
    * @param {string} msg
    * @public
    */
    showAlert(type, msg){
      var self = this;
      this.isAlert = true;
      this.alertMsg = msg;
      this.alertType = type;
      setTimeout(function(){ self.isAlert = false; }, 8000);
    },//showAlert

    /**
    * Logout the application using the Keycloak JavaScript adapter
    *
    * @public
    */
    logout: function(){
      this.$keycloak.logoutFn();
    },//logout
   },
  mounted: function(){
    this.initMap();
  },
  created(){

    this.user = JSON.parse(window.atob(this.$keycloak.token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
    this.$store.state.user = this.user;

    this.$eventBus.$on('show-alert', (type, msg)  => {
      this.showAlert(type, msg);
    });

    this.$eventBus.$on('show-outputPanel', (bool, url)  => {      
      this.showOutput(bool, url)      
    });
  },
  filters: {
    truncate: function(value) {
      if(value != undefined){
        value = value.toString().substring(0, 16);
      }
      return value
    },
    formatDate: function(value) {
      if (value) {
        return moment(String(value)).format('MM/DD/YYYY hh:mm')
      }
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.green {
  background: linear-gradient(60deg,#66bb6a,#43a047) !important;
	-webkit-box-shadow: 0 12px 20px -10px rgba(76,175,80,.28),0 4px 20px 0 rgba(0,0,0,.12),0 7px 8px -5px rgba(76,175,80,.2) !important;
	box-shadow: 0 12px 20px -10px rgba(76,175,80,.28),0 4px 20px 0 rgba(0,0,0,.12),0 7px 8px -5px rgba(76,175,80,.2) !important;
}

.exp-tittle{
  color: #37aa48;
  font-size: 20px !important;
  font-family: Roboto,sans-serif !important;
  font-weight: 500; line-height: 1 !important;
  letter-spacing: .02em !important;
}

</style>
