import { Requestor } from "../structures/Requestor.js";
// import {Utility} from "../structures/Utility.js";
import {VerifyDatabaseTablesExist} from "./PageControl.js";
import { DisplayClientSideNotification } from "../system_semantics/NotificationControl.js";



function LoadCaptchaImage(data = Object) {
    // console.log("Data:");
    // console.log(data);
    // console.log("Data's type: ", typeof(data));
    // let captchaFileNameInput = document.getElementById('CaptchaFileNameInput');
    let captchaImageHandle = document.getElementById('CaptchaImage');

    let imagePath = "../../../resources/CaptchaImages/" + data['random_captcha_image_name'];
    // captchaFileNameInput.value = data['random_captcha_image_name'];
    captchaImageHandle.src = imagePath;

    RegisterCaptchaRefreshCallback();
}


async function FetchCaptchaImageChoice() {
    let serverScriptPath = "../../_server/system_semantics/apis/ServeRandomCaptchaImageName.php";
    let rq = new Requestor();
    const data = await rq.SendPost(serverScriptPath, "json", "json", {});    
    LoadCaptchaImage(data);
}


function RegisterCaptchaRefreshCallback()
{
    let captchaRefreshButton = document.getElementById("CaptchaRefreshButton");
    captchaRefreshButton.addEventListener('click', async ()=> {await FetchCaptchaImageChoice()});
}

const LoginPageScript = async ()=>{
    DisplayClientSideNotification();
    await VerifyDatabaseTablesExist();
    await FetchCaptchaImageChoice();
}

LoginPageScript();