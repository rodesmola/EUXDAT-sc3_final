var domain = 'test.euxdat.eu';
var dbHost = 'https://geodb-devel.'+domain+'/xalkidiki/';
var cloudifyHost = 'https://cloudify-api.'+domain+'/api/v3.1/';
var apacheHost = 'https://apache.'+domain+'/agroclimatic_zones_scenario_outputs/';
var authKey= 'Basic YWRtaW46RXV4ZGF0MTIzNDUh';

var platformHost = 'https://test.euxdat.eu';
var cloudifyHeader = 'Basic YWRtaW46YWRtaW4=';

var keyCloakConf = {
  authRealm: "euxdat",
  authUrl: 'https://'+domain+'/auth',
  authClientId: "frontend",
  logoutRedirectUri: 'https://'+domain,
};


const CONST = {
    dbHost: dbHost,    
    cloudifyURL: cloudifyHost,
    apacheURL: apacheHost,  
    authHeader: authKey,      
    keyCloakConf: keyCloakConf,
    cloudifyHeader: cloudifyHeader,
    platformHost: platformHost
};

export default CONST

