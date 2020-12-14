<template>
    <div>
    
      <v-flex xs12 pl-2 row>
        <!-- <v-form ref="agroClimaticDataForm" v-model="agroClimaticDataValid"> -->
          <v-form ref="agroClimaticForm">
            <v-layout row wrap class="pl-2 pr-2"> 
              
              <v-flex xs12 class="pl-1 pr-1">
                <UserPolygons/>
              </v-flex>

              <v-flex xs12 sm12 md12 lg12 class="mb-3">                
                <v-divider ></v-divider>
              </v-flex>

              <v-flex xs6 class="pl-3 pr-3">
                <v-text-field hide-no-data hide-selected dense color="#77b942" type="text" v-model="agroClimaticData.hour_start" 
                    :value="agroClimaticData.hour_start" label="Start hour *"  
                    @input="$v.agroClimaticData.hour_start.$touch()" @blur="$v.agroClimaticData.hour_start.$touch()"
                    :error-messages="hour_startErrors">
                </v-text-field>                         
              </v-flex>
              <v-flex xs6 class="pl-3 pr-3">
                <v-text-field hide-no-data hide-selected dense color="#77b942" type="text" v-model="agroClimaticData.hour_end" 
                    :value="agroClimaticData.hour_end" label="End hour *" 
                    @input="$v.agroClimaticData.hour_end.$touch()" @blur="$v.agroClimaticData.hour_end.$touch()"
                    :error-messages="hour_endErrors">
                </v-text-field>                            
              </v-flex>
  
              <v-flex xs6 class="pl-3 pr-3">
                <v-text-field hide-no-data hide-selected dense color="#77b942" type="text" v-model="agroClimaticData.years_start" 
                    :value="agroClimaticData.years_start" label="Start year *" 
                    @input="$v.agroClimaticData.years_start.$touch()" @blur="$v.agroClimaticData.years_start.$touch()"
                    :error-messages="years_startErrors">
                </v-text-field>
              </v-flex>
              <v-flex xs6 class="pl-3 pr-3">
                <v-text-field hide-no-data hide-selected dense color="#77b942" type="text" v-model="agroClimaticData.years_end" 
                    :value="agroClimaticData.years_end" label="End year *" 
                    @input="$v.agroClimaticData.years_end.$touch()" @blur="$v.agroClimaticData.years_end.$touch()"
                    :error-messages="years_endErrors">
                </v-text-field>                        
              </v-flex>

              <v-flex xs6 class="pl-3 pr-3">
                <v-text-field hide-no-data hide-selected dense color="#77b942" type="text" v-model="agroClimaticData.day_row" 
                    :value="agroClimaticData.day_row" label="Day in row *" 
                    @input="$v.agroClimaticData.day_row.$touch()" @blur="$v.agroClimaticData.day_row.$touch()"
                    :error-messages="day_rowErrors">
                </v-text-field>   
              </v-flex>

              <v-flex xs6 class="pl-3 pr-3">
                <v-text-field hide-no-data hide-selected dense color="#77b942" type="text" v-model="agroClimaticData.frost_degree" 
                    :value="agroClimaticData.frost_degree" label="Frost degree *" 
                    @input="$v.agroClimaticData.frost_degree.$touch()" @blur="$v.agroClimaticData.frost_degree.$touch()"
                    :error-messages="frost_degreeErrors">
                </v-text-field>  
              </v-flex>
              <v-flex xs6 class="pl-3 pr-3">
                <v-text-field hide-no-data hide-selected dense color="#77b942" type="text" v-model="agroClimaticData.probability" 
                    :value="agroClimaticData.probability" label="Probability (%) *" 
                    @input="$v.agroClimaticData.probability.$touch()" @blur="$v.agroClimaticData.probability.$touch()"
                    :error-messages="probabilityErrors">
                </v-text-field> 
              </v-flex>
              <v-flex xs12 sm12 md12 lg12>
                <small >* Indicates required field</small>
                <v-divider ></v-divider>
              </v-flex>

              <v-flex xs12 sm12 md12 lg12 v-if="!isSelected" class="green panel-chip">
                <span color="#4ba64f" label>Please select a polygon to start the service.</span>
              </v-flex>         

              <v-flex xs12 sm12 md12 lg12 v-if="isOutput" class="panel-chip" style="background-color: #294247; color: white;">
                <span color="#4ba64f" label>Press "start" to remove outputs.
                  <v-btn small flat dark @click="resetFrom()" title="Re-launch service">
                    start
                  </v-btn>
                </span>
              </v-flex>                   

              <v-flex xs12 class="text-xs-right pr-3" v-if="isSelected && !isOutput" style="padding: 0px; margin-bottom: 5px;">
                <v-btn small round color="#27304c"  dark @click="runService()" title="Run service" >
                RUN
                </v-btn>
              </v-flex>

            </v-layout>
        </v-form> 
      </v-flex>

      <!------------ Progress dialog start ------------>
      <v-dialog v-model="isRunning" persistent max-width="180">

        <v-card>
          <v-card-text style="text-align: center;">
            <img style="width: 120px;" src="../assets/logo_titulo.png" alt="">

            <v-progress-circular :size="60" :width="7" color="green" indeterminate style="margin-top: 15px;"></v-progress-circular>

            <v-flex xs12 style="color: #37aa48; font-size 12px; margin-bottom: 10px; margin-top: 10px;">
              Processing...
            </v-flex>
          </v-card-text>
        </v-card>

      </v-dialog>
      <!------------ Progress dialog end ------------>

    </div>
</template>

<script>
import { required, numeric, between, decimal } from 'vuelidate/lib/validators'
import {Vector as VectorLayer} from 'ol/layer.js';
import GeoJSON from 'ol/format/GeoJSON';
import VectorSource from 'ol/source/Vector';
import {Fill, Stroke, Style, Circle} from 'ol/style.js';

import UserPolygons from '@/components/UserPolygons.vue'
import CONST from "../const";

export default {
    name: "AgroclimaticZones",
    components: {
        UserPolygons
    },
    props: {},
    data: () => ({
      cloudifyURL: CONST.cloudifyURL,  
      authHeader: CONST.authHeader, 
      apacheURL: CONST.apacheURL,
      isRunning: false, 
      downloadURL: "",
      isSelected: false,
      isOutput: false,
      agroClimaticData: {
        hour_start: 0,
        hour_end: 23,
        years_start: 2017,
        years_end: 2018,
        day_row: 1,
        frost_degree: 0,
        probability: 10
      }    
    }),
    methods: {
      /**
      * Create a new deployment and install it
      *
      * @public
      */
      runService(){

        var self = this;
        this.isRunning = true;
        this.deploymentName = this.$store.state.user.preferred_username.slice(2) + '-' + Date.now().toString();
        var url = this.cloudifyURL.concat("deployments/", this.deploymentName);

        var selectedPolygon = this.$store.state.selectedPolygon.getGeometry().getExtent();

        var headers = {
          'Authorization': this.authHeader,
          'Tenant': 'default_tenant'  ,
          'Content-Type': 'application/json'
        };
        var body = {
          "blueprint_id":"agroclimatic_frostdates_epsg",
          "inputs": {
            "epsg_string": "epsg:3857",
            "username": this.$store.state.user.preferred_username.toString(),
            "process_id": this.deploymentName.toString(),
            "day_in_row": this.agroClimaticData.day_row.toString(),
            "start_hour_day": this.agroClimaticData.hour_start.toString(),
            "end_hour_day": this.agroClimaticData.hour_end.toString(),
            "frost_degree": this.agroClimaticData.frost_degree.toString(),
            "start_year": this.agroClimaticData.years_start.toString(),
            "end_year": this.agroClimaticData.years_end.toString(),
            "probability": this.agroClimaticData.probability.toString(),
            "start_lon": selectedPolygon[0].toString(),
            "start_lat": selectedPolygon[1].toString(),
            "end_lon": selectedPolygon[2].toString(),
            "end_lat": selectedPolygon[3].toString()
          }
        };

        this.$http.put(url, body, {headers}).then(response => {
          url = this.cloudifyURL.concat("executions");
          body = {
            "deployment_id": this.deploymentName,
            "workflow_id": "install"
          };

          setTimeout(function(){
            self.$http.post(url, body, {headers}).then(response => {

              setTimeout(function(){
                self.getExecutionStatus(response.body.deployment_id);
              }, 5000);
                self.$eventBus.$emit('show-alert', "success", response.statusText);

            }, response => {
              self.$eventBus.$emit('show-alert', "error", response.statusText);
            });
          }, 5000);          
          self.$eventBus.$emit('show-alert', "success", response.statusText);

          }, response => {
            self.$eventBus.$emit('show-alert', "error", response.statusText);
        });
        
      },//runService      
      /**
      * Check the running status, if is "terminated" triggerd getGeojson() method
      *
      * @param {string} id
      * @public
      */
      getExecutionStatus(id){

        var self = this;
        var url = this.cloudifyURL.concat("deployments/", id, "/outputs");
        var headers = {
          'Authorization': this.authHeader,
          'Tenant': 'default_tenant'
        };

        this.$http.get(url, {headers}).then(response => {

          if(response.body.outputs.agroclimatic_frostdate_status === null){
            setTimeout(function(){
              self.getExecutionStatus(id);
            }, 3000);
          }else if (response.body.outputs.agroclimatic_frostdate_status[0].state.terminated === null){
            setTimeout(function(){
              self.getExecutionStatus(id);
            }, 5000);
          }else{
            if(response.body.outputs.agroclimatic_frostdate_status[0].state.terminated.reason === "Completed"){
              self.getGeojson();
            }else{
              self.resetFrom();
              self.isRunning = false;
              self.$eventBus.$emit('show-alert', "error", response.statusText);
            }
          }

          }, response => {
            self.$eventBus.$emit('show-alert', "error", response.statusText);
        });

      },//getExecutionStatus    
     
      /**
      * Get the GeoJSON generated by the service
      *
      * @public
      */
      getGeojson(){

        this.isRunning = false;
        var self = this;
        var url = this.apacheURL.concat(this.$store.state.user.preferred_username, '/frostdates/', this.deploymentName, '.geojson');
        this.downloadURL = url;

        var headers = {
          'Authorization': this.authHeader,
          'Tenant': 'default_tenant'
        };

        this.$http.get(url, {headers}).then(response => {

          if(response.body.toString().length === 45){            
            self.$eventBus.$emit('show-alert', "error", "No output data generated, try a bigger area");
            self.resetFrom();
            this.isRunning = false;
          }else{
            self.drawOutput(response.body);            
          }
        }, response => {
          self.$eventBus.$emit('show-alert', "error", response.statusText);
        });
      },//getGeojson
      /**
      * Get the GeoJSON and add to the map, also set the style and zoom in
      * the selected polygon
      *
      * @param {json} geojson
      * @public
      */
      drawOutput(geojson){

        var vectorSource = new VectorSource({
          features: (new GeoJSON()).readFeatures(geojson)
        });

        var vectorLayer = new VectorLayer({
          source: vectorSource,
          style: new Style({
            image: new Circle({
              radius: 7,
              fill: new Fill({color: 'blue'}),
              stroke: new Stroke({
                color: 'red',
                width: 3
              })
            })
          })
        });

        vectorLayer.set('name', 'output');
        this.$store.state.map.addLayer(vectorLayer);
        vectorLayer.setZIndex(99)
        this.isRunning = false;
        this.isOutput = true;
        this.$store.state.map.getView().fit(this.$store.state.selectedPolygon.getGeometry().getExtent());
        this.$eventBus.$emit('show-outputPanel', true, this.downloadURL);
        this.$eventBus.$emit('disable-addBtn', true);

      },//drawOutput   
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
      /**
      * Reset the form, clear layer selection and remove the output layer form map
      *
      * @public
      */
      resetFrom(){
        
        this.isOutput = false;
        this.outputPanel = false;       
        this.$store.state.interactionSelect.getFeatures().clear();
        this.$eventBus.$emit('remove-outputLayer', 'output');
        this.$eventBus.$emit('disable-addBtn', false);
        this.$eventBus.$emit('show-outputPanel', false, this.downloadURL);

        this.agroClimaticData = {
          hour_start: 0,
          hour_end: 23,
          years_start: 2017,
          years_end: 2018,
          day_row: 1,
          frost_degree: 0,
          probability: 10
        }  

      },//resetFrom
            
    },
    validations: {
      agroClimaticData:{               
        hour_start: {numeric, required, between: between(0, 24)},  
        hour_end: {numeric, required, between: between(0, 24)},
        years_start: {numeric, required, between: between(1985, 2020)},
        years_end: {numeric, required, between: between(1985, 2020)},
        day_row: {numeric, required, between: between(1, 365)},
        frost_degree: {decimal, required, between: between(-15, 50)},       
        probability: {numeric, required, between: between(0, 100)},   
      }
    },    
    computed: {
      hour_startErrors () {
        const errors = []
        if (!this.$v.agroClimaticData.hour_start.$dirty) return errors
          !this.$v.agroClimaticData.hour_start.required && errors.push('Mandatory field')
          !this.$v.agroClimaticData.hour_start.between && errors.push('Values from 0 to 24')
          !this.$v.agroClimaticData.hour_start.numeric && errors.push('Insert a number')
          return errors
        },   
      hour_endErrors () {
        const errors = []
        if (!this.$v.agroClimaticData.hour_end.$dirty) return errors
          !this.$v.agroClimaticData.hour_end.required && errors.push('Mandatory field')
          !this.$v.agroClimaticData.hour_end.between && errors.push('Values from 0 to 24')
          !this.$v.agroClimaticData.hour_end.numeric && errors.push('Insert a number')
          return errors
        },
      years_startErrors () {
        const errors = []
        if (!this.$v.agroClimaticData.years_start.$dirty) return errors
          !this.$v.agroClimaticData.years_start.required && errors.push('Mandatory field')
          !this.$v.agroClimaticData.years_start.between && errors.push('Values from 1985 to 2020')
          !this.$v.agroClimaticData.years_start.numeric && errors.push('Insert a number')
          return errors
        },        
      years_endErrors () {
        const errors = []
        if (!this.$v.agroClimaticData.years_end.$dirty) return errors
          !this.$v.agroClimaticData.years_end.required && errors.push('Mandatory field')
          !this.$v.agroClimaticData.years_end.between && errors.push('Values from 1985 to 2020')
          !this.$v.agroClimaticData.years_end.numeric && errors.push('Insert a number')
          return errors
        },    
      day_rowErrors () {
        const errors = []
        if (!this.$v.agroClimaticData.day_row.$dirty) return errors
          !this.$v.agroClimaticData.day_row.required && errors.push('Mandatory field')
          !this.$v.agroClimaticData.day_row.between && errors.push('Values from 1 to 365')
          !this.$v.agroClimaticData.day_row.numeric && errors.push('Insert a number')
          return errors
        },    
      frost_degreeErrors () {
        const errors = []
        if (!this.$v.agroClimaticData.frost_degree.$dirty) return errors
          !this.$v.agroClimaticData.frost_degree.required && errors.push('Mandatory field')
          !this.$v.agroClimaticData.frost_degree.between && errors.push('Values from -15 to 50')
          !this.$v.agroClimaticData.frost_degree.decimal && errors.push('Insert a number')
          return errors
        },  
      probabilityErrors () {
        const errors = []
        if (!this.$v.agroClimaticData.probability.$dirty) return errors
          !this.$v.agroClimaticData.probability.required && errors.push('Mandatory field')
          !this.$v.agroClimaticData.probability.between && errors.push('Values from 0 to 100')
          !this.$v.agroClimaticData.probabilitye.numeric && errors.push('Insert a number')
          return errors
        },                     
      },
    watch: {

    },
    created(){
      this.$eventBus.$on('is-selected', (bool)  => {      
        this.isSelected = bool      
      });
    }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.v-input {
	font-size: 12px;
	text-align: left;
}
.v-text-field {
	padding-top: 0px;
	margin-top: 4px;
}

.v-btn--small {
	font-size: 12px;
	height: 20px;
	padding: 0 8px;
  min-width: 58px;
}

.panel-chip {
  padding: 0px;
  text-align: center;
  margin: 5px;
  padding: 2px;
  border-radius: 2px;
  justify-content:
  space-between;
  font-family: 'Roboto', sans-serif;
  font-size: 12px;
}
</style>


