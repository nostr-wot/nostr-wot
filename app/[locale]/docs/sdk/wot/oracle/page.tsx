import {SdkDocPage, sdkDocMetadata} from "@/components/docs/SdkDocPage";
import {withMetadataPolicy} from "@/lib/metadata-policy";
const path="/docs/sdk/wot/oracle";
export const generateMetadata=withMetadataPolicy(sdkDocMetadata(path));
export default function Page({params}:{params:Promise<{locale:string}>}){return <SdkDocPage path={path} params={params}/>;}
