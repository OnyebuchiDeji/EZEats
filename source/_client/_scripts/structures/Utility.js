/**
 *  This structure provides various functionality functions that will be used many times
 *  
 */


class Utility
{
    constructor(shouldDebug=true)
    {
        this.ShouldDebug = shouldDebug;
    }

    Log(msg){
        if (this.ShouldDebug){
            console.log(msg);
        }
    }

    /**
     *  Capitalizes the first letter of every word separated
     *  by a space.
    */
    Capitalize(str="")
    {
        //  Use let to limit varaible's scope.
        let words = str.split(" ");
        for (let i=0;i<words.length;++i){
            words[i] = words[i].charAt(0).toUpperCase() + words[i].slice(1);
        }
        return words.join(" ");
    }

    /**
     *  Capitalizes the first word of every sentence. 
     * 
    */
    CapitalizeSentences(str="")
    {
        let seperator = ". ";
        let sentences = str.split(seperator);
        for (let i=0; i<sentences.length; ++i){
            sentences[i] = sentences[i].charAt(0).toUpperCase() + sentences[i].slice(1);
        }
        return sentences.join(". ");
    }

    NotificationMessageSplit(msg="")
    {
        let msgArr = msg.split(";");
        let status = msgArr[0].split(":")[1];
        let message = msgArr[1].split(":")[1];
        status = status.trim().toLowerCase();
        message = this.Capitalize(message.trim());

        return {
            'status':status,
            'message':message,
        }
    }

    GetInitials(firstName, lastName, capitalize=false)
    {
        let res = firstName.charAt(0) + lastName.charAt(0);
        return capitalize ? res.toUpperCase() : res;
    }
}

export {Utility};