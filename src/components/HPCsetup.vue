<template>
<span></span>

</template>

<script>

import CONST from "../const";
import HPC from "../hpc";

export default {
    name: "HPCsetup",
    components: {        
    },
    props: {},
    data: () => ({
        cloudifyURL: CONST.cloudifyURL,  
        authHeader: CONST.authHeader, 
        apacheURL: CONST.apacheURL,
        HPCdata: HPC.HPCsetup,
        cloudifyHeader: CONST.cloudifyHeader,    
        //deploymentName: ""  
    }),
    methods: {
        /**
         * Create a new deployment and install it
         *
         * @public
         */
        runHPCService(agroClimaticData, deploymentName){
            
            var self = this;
            this.$eventBus.$emit('is-running', true);

            var url = 'https://cloudify-api-test.test.euxdat.eu/api/v3.1/'.concat("deployments/", deploymentName);
            var headers = {
                'Authorization': this.cloudifyHeader,
                'Tenant': 'default_tenant'  ,
                'Content-Type': 'application/json'
            };

            this.$http.put(url, this.createInputObject(agroClimaticData, deploymentName), {headers}).then(response => {
                url = 'https://cloudify-api-test.test.euxdat.eu/api/v3.1/'.concat("executions");
                var body = {
                    "deployment_id": deploymentName,
                    "workflow_id": "install"
                };

                setTimeout(function(){
                    self.$http.post(url, body, {headers}).then(response => {
                        
                        self.getExecutionStatus(response.body.id, deploymentName);                    
                        self.$eventBus.$emit('show-alert', "success", response.statusText);

                    }, response => {
                        self.$eventBus.$emit('show-alert', "error", response.statusText);
                    });
                }, 15000);
                self.$eventBus.$emit('show-alert', "success", response.statusText);
            }, response => {
                self.$eventBus.$emit('show-alert', "error", response.statusText);
            });

        }, //runHPC

        getExecutionStatus(id, deploymentName){

            var self = this;
            var url = "http://cloudify-api-test.test.euxdat.eu/api/v3.1/executions/".concat(id, '?_include=status');
            var headers = {
                'Authorization': this.cloudifyHeader,
                'Tenant': 'default_tenant'
            };

            this.$http.get(url, {headers}).then(response => {
        
                if(response.body.status === 'terminated'){
                    url = 'https://cloudify-api-test.test.euxdat.eu/api/v3.1/'.concat("executions");
                    var headers = {
                        'Authorization': this.cloudifyHeader,
                        'Tenant': 'default_tenant'  ,
                        'Content-Type': 'application/json'
                    };                       
                    var body = {
                        "deployment_id": deploymentName,
                        "workflow_id": "run_jobs"
                    };
                    self.$http.post(url, body, {headers}).then(response => {                                 
                        self.$eventBus.$emit('show-alert', "success", response.statusText);
                        self.getRunJobStatus(response.body.id, response.body.deployment_id)
                    }, response => {
                        self.$eventBus.$emit('show-alert', "error", response.statusText);
                    });
                }else {
                    setTimeout(function(){
                        self.getExecutionStatus(id, deploymentName)
                    }, 5000);
                }                     

                }, response => {
                    self.$eventBus.$emit('show-alert', "error", response.statusText);
            });

        },//getExecutionStatus

        getRunJobStatus(workflow_id, deployment_id){

            var self = this;
            var url = "http://cloudify-api-test.test.euxdat.eu/api/v3.1/executions/".concat(workflow_id, '?_include=status');
            var headers = {
                'Authorization': this.cloudifyHeader,
                'Tenant': 'default_tenant'
            };

            this.$http.get(url, {headers}).then(response => {
        
                if(response.body.status === 'terminated'){
                
                    var urlFinal = "https://apache.test.euxdat.eu/agroclimatic_zones_scenario_outputs/".concat(this.$store.state.user.preferred_username, 
                    "/frostdates/", deployment_id, ".geojson")        
                    var headersFinal = {
                        'Authorization': this.authHeader,
                        'Tenant': 'default_tenant'
                    };

                    this.$http.get(urlFinal, {headersFinal}).then(response => {

                        //self.drawOutput(response.body)
                        self.$eventBus.$emit('draw-output', response.body);

                    }, response => {
                        self.$eventBus.$emit('show-alert', "error", response.statusText);
                    });

                }else if(response.body.status === 'failed'){
                    self.$eventBus.$emit('show-alert', "error", response.statusText);           
                }else {
                    setTimeout(function(){
                        self.getRunJobStatus(workflow_id, deployment_id)
                    }, 5000);
                }                     

                }, response => {
                    self.$eventBus.$emit('show-alert', "error", response.statusText);
            });

        },

        createInputObject(agroClimaticData, deploymentName){

            
            var selectedPolygon = this.$store.state.selectedPolygon.getGeometry().getExtent();

            var HPC = {
                'blueprint_id': 'agroclimatic_frostdates_pilot_hawk_priority_512cores_new', //'test_blueprint_agroclimatic_4cores', 
                inputs: {
                    'hpc_base_dir': '$HOME',
                    'hpc_interface_config': {
                        'country_tz': 'Europe/Stuttgart',
                        'infrastructure_interface': 'PBSPRO'
                    },
                    'hpc_interface_credentials': {
                        'host': 'hawk.hww.hlrs.de',
                        'user': this.HPCdata.hpcCredentials.user, //<hpc_user_name></hpc_user_name>,
                        'password': this.HPCdata.hpcCredentials.password, //<hpc_user_password></hpc_user_password>,
                        'private_key': this.HPCdata.hpcCredentials.private_key, //<hpc_user_private_key></hpc_user_private_key>,
                        'private_key_password': this.HPCdata.hpcCredentials.private_key_password //<hpc_user_private_password></hpc_user_private_password>
                    },
                    'partition_name': 'default', 
                    'job_config_content':
                        'import os'.concat(
                        '\n sl-DAY_IN_ROW = ', agroClimaticData.day_row, 
                        '\n sl-START_HOUR_DAY = ', agroClimaticData.hour_start, 
                        '\n sl-END_HOUR_DAY = ', agroClimaticData.hour_end,
                        '\n sl-FROST_DEGREE = ', agroClimaticData.frost_degree,
                        '\n sl-START_YEAR = ', agroClimaticData.years_start,
                        '\n sl-END_YEAR = ', agroClimaticData.years_end,
                        '\n sl-PROBABILITY = ', agroClimaticData.probability,
                        '\n sl-path=os.path.abspath(__file__ + \"/../../\")\n ',  
                        'sl-EXPORT_FOLDER =path + \"/export\"\n ',   
                        'sl-DATA_FOLDER = path + \"/data\"\n ',
                        'sl-START_LON = ', selectedPolygon[0].toString(),
                        '\n sl-START_LAT = ', selectedPolygon[1].toString(),  
                        '\n sl-END_LON = ', selectedPolygon[2].toString(),  
                        '\n sl-END_LAT = ', selectedPolygon[3].toString(), 
                        '\n sl-process_id = \"test_frostdatelatlon\"').replace(/\n/g, "\\n").replace(/\"/g, '\\"').replace(/sl-/g, "\n"),
                    'job_config_pathname': '~/sc3_agroclimatic/frostdates/cloudify_integration/python_code/frostdates_params.py',
                    'monitoring_options': {
                        'reporting_user': this.$store.state.user.preferred_username, //<frontend_user></frontend_user>
                    },
                    'accounting_options': {
                        'reporting_user': this.$store.state.user.preferred_username, //<frontend_user></frontend_user>
                    },
                    'data_mover_options': {
                        'workspace': 'ws_agroclimatic', 
                        'create_ws': false, 
                        'ws_lifetime': 30,
                        "upload": {
                            "source": "./output_concatenated_files.geojson", 
                            "target": "agroclimatic_zones_scenario_outputs/".concat(this.$store.state.user.preferred_username, "/frostdates/", deploymentName, ".geojson"),
                        },               
                        'hpc_target': 'HAWK', 
                        'cloud_target': 'ATOSFR', 
                        'cloud_user': 'euxdat_user',
                        'grid_userkey': this.HPCdata.gridFTP.grid_userkey,//'|'.concat(HPCdata.grid.userkey), // <gridftp userkey></gridftp userkey>,
                        'grid_usercert': this.HPCdata.gridFTP.grid_usercert,// '|'.concat(HPCdata.grid.usercert), //<gridftp usercert></gridftp usercert>,
                        'grid_certpass': this.HPCdata.gridFTP.grid_certpass, //<gridftp userpass></gridftp userpass>
                    }  
                }
            };
           
            return HPC;

        },
    },
   
    created(){
        this.$eventBus.$on('run-hpc', (data)  => {      
            this.runHPCService(data, this.$store.state.user.preferred_username.slice(2) + '-' + Date.now().toString());
        });
    }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

</style>


