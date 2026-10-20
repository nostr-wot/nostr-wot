import {IntegrationRecipes} from "./IntegrationRecipes";
import setup from "./SdkSection-setup";
import compatibility from "./SdkSection-compatibility";
import data from "./SdkSection-data";
import relay from "./SdkSection-relay";
import passkeys from "./SdkSection-passkeys";
import passkey_interoperability from "./SdkSection-passkey-interoperability";
import ui from "./SdkSection-ui";
import wot from "./SdkSection-wot";
import Pq from "./SdkSection-pq";
const sections = {"setup":setup,"compatibility":compatibility,"data":data,"relay":relay,"passkeys":passkeys,"passkey-interoperability":passkey_interoperability,"ui":ui,"wot":wot,pq:Pq};
export function SdkTopicContent({id}:{id:string}) { if(id in sections){const Content=sections[id as keyof typeof sections];return <Content/>;} return <IntegrationRecipes area="sdk" ids={[id]}/>;}
