import { _dev } from "../constants/dev";
import { _production } from "../constants/production";

interface Config {
   
    baseEndpoint: string
 
}

let _config: Config = {
  
    baseEndpoint: ''
  
};

const PRODUCTION = 'PRODUCTION';
const DEVELOPMENT = 'DEV';
const ENVIRONMENT = process.env.ENVIRONMENT || DEVELOPMENT;


if (ENVIRONMENT.toUpperCase() === PRODUCTION) {
   
            _config.baseEndpoint = _production.common.baseEndpoint;

        
    }
 else if (ENVIRONMENT.toUpperCase() === DEVELOPMENT) {
            _config.baseEndpoint = _dev.common.baseEndpoint;

        
    }


export default _config;