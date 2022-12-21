function isValidURL(string) {
    try {
        new URL(string);
    } catch (_) {
        return false;
    }

    return true;
}


class API{
    constructor(host, port){
        this._root = "http://" + host + ":" + port;
    }

    get root(){
        return this._root;
    }


    post(url, data){
        return $.ajax({
            url: this._root + url,
            type: "POST",
            data: data,
            dataType: "json"
        });
    }

    put(url, data){
        return $.ajax({
            url: this._root + url,
            type: "PUT",
            data: data,
            dataType: "json"
        });
    }

    delete(url){
        return $.ajax({
            url: this._root + url,
            type: "DELETE",
            dataType: "json"
        });
    }

    // get overload with data
    get(url, data = {}, callback = null){
        return $.ajax({
            url: this._root + url,
            type: "GET",
            data: data,
            dataType: "json",
            success: callback
        });
    }
}

var api = new API("localhost", "5000");

$(".checkbox").on("click", function () {
    // get the .fill from children and toggle disply
    var fill = $(this).find(".fill");
    var state = false;
    if (fill.hasClass("active")) {
        fill.removeClass("active");
    } else {
        fill.addClass("active");
        state = true;
    }

    // set the checked attribute of the .checkbox
    $(this).attr("checked", state);
});

{
    /* <div class="info-item">
<span>Key</span>
<span>Value</span>
</div>
<div class="info-item">
<span>This is an image and a really long fucking string efgyhiudfgjlkhWATYferyjukyjwYEGTHERO;GIQWUUIRDGHAS8ODHASFIOASSSIDU8UFYJHSDMFSD</span>
<img src="assets/img/testimg.png" alt="Test Image">
</div> */
}

// https://www.youtube.com/watch?v=vQA8p4KHE5E TEST URL

function show_settings(state){
    // if state, set active to #settings
    if(state){
        $("#settings").addClass("active");
    }else{
        $("#settings").removeClass("active");
    }
}


function show_info_area(state){
    // if state, set active to #info-area
    if(state){
        $("#info-area").addClass("active");
    }else{
        $("#info-area").removeClass("active");
    }
}

function show_loading_status(state){
    // if state, show #loader, else show #info-list
    if(state){
        $("#loader").css("display", "flex");
        $("#info-list").removeClass("active");
    }else{
        $("#loader").css("display", "none");
        $("#info-list").addClass("active");
    }
}

$("#url-bar").on("keyup", function (e) {
    // if not empty and has a valid URL
    if ($(this).val() != "" && isValidURL($(this).val())) {
        // if enter is pressed
        if (e.keyCode == 13) {
            show_settings(true);
        }
    }else{
        console.log("INVALID");
    }

})

function add_info_item(key, value){
    // key is a string, value can be a string or img
    // check if value is a {}
    if(typeof value == "object"){
        // objects are used to create combo boxes
        // the object contains a default value called "default" with the default index
        // and a list of options called "options" with a list of options
        // the object has an ID for references
        var item = $(`
        <div class="info-item">
            <span>${key}</span>
            <select id="${value.id}">
            </select>
        </div>
        `);
        // add options
        for (let i = 0; i < value.options.length; i++) {
            const element = value.options[i];
            // if element is object, get the name, and data
            if(typeof element == "object"){
                var option = $(`<option value="${btoa(element.data)}">${element.name}</option>`);
            }
            else{
                var option = $(`<option value="${element}">${element}</option>`);
            }
            item.find("select").append(option);
        }
        // set default value, get the index
        var index = value.options.indexOf(value.default);
        // item.find("select").val(value.options[value.default])
        // if the index is an object, get the name and set that
        if(typeof value.options[index] == "object"){
            item.find("select").val(value.options[index].name);
        }else{
            item.find("select").val(value.options[index]);
        }

    }else{

        var item = $(`
        <div class="info-item">
            <span>${key}</span>
            <span>${value}</span>
        </div>
        `);
    }
    $("#info-list").append(item);
}

function getStreamType(ext, comparator = null){
    var audio_types = ["mp3", "m4a", "webm", "aac", "ogg", "opus", "wav"];
    var video_types = ["mp4", "webm", "flv", "3gp"];

    var final_type = "unknown";

    if(audio_types.includes(ext)){
        final_type = "audio";
    }else if(video_types.includes(ext)){
        final_type = "video";
    }else{
        final_type = "unknown";
    }

    if (comparator){
        // this is the format object, if check for audio conflict like m4a with null resolution
        if (final_type == "audio" && comparator.height == null){
            final_type = "audio";
        }else if(final_type == "video" && comparator.height != null){
            final_type = "video";
        }
    }
    try{
        console.log(`[DEBUG] Extension: ${ext}, Final Type: ${final_type}, Resolution: ${comparator.height}x${comparator.width}`)
    }catch{

    }
    return final_type;
}

var settings = {}
$("#continue").on("click", function(){
    // show loader and clear info list
    $("#info-list").empty();
    show_loading_status(true);

    for (let i = 0; i < $("#settings .checkbox").length; i++) {
        const element = $("#settings .checkbox")[i];
        var checked = $(element).attr("checked");
        // if undefined, its false
        if(checked == undefined){
            checked = false;
        }else{
            checked = true
        }
        settings[$(element).attr("id")] = checked;

    }
    settings["url"] = $("#url-bar").val();
    show_info_area(true);
    show_loading_status(true);
    api.get("/metadata", settings, function(data){
        data = JSON.parse(data);
        console.log(data)
        if (data.error){
            console.log(data.error);
            return;
        }
        show_loading_status(false);
        var title = data.title;

        // use regex to find any tags in the video (format: {#tag/#tag/#tag})
        var tags = title.match(/\{.*?\}/g);
        // if tags are found, replace them with <span class="tag">tag</span>
        if(tags){
            for (let i = 0; i < tags.length; i++) {
                const element = tags[i];
                // remove the brackets
                var tag = element.replace("{", "").replace("}", "");
                // split the tags by /
                var tag_list = tag.split("/");
                // create a new string
                var new_tag = "";
                // for each tag, add a span with the tag
                for (let i = 0; i < tag_list.length; i++) {
                    const element = tag_list[i];
                    new_tag += `<span class="tag">${element}</span>`;
                }
                // replace the tag with the new tag
                title = title.replace(element, new_tag);
            }
        }



        add_info_item("Title", title);

        var thumbnail = data.thumbnail;
        add_info_item("Thumbnail", `<img src="${thumbnail}" alt="Thumbnail">`);
        
        var duration = data.duration;
        // format from seconds to hh:mm:ss
        var hours = Math.floor(duration / 3600);
        var minutes = Math.floor((duration - (hours * 3600)) / 60);
        var seconds = duration - (hours * 3600) - (minutes * 60);
        if (hours < 10) {hours = "0"+hours;}
        if (minutes < 10) {minutes = "0"+minutes;}
        if (seconds < 10) {seconds = "0"+seconds;}
        duration = hours + ':' + minutes + ':' + seconds;
        add_info_item("Duration", duration);

        // if youtube, check the "raw" key and list all audio streams available
        if (data.provider == "youtube"){
            var raw = data.raw;
            var streams = raw.formats

            // remove find the highest quality video and audio streams and keep them, remove the rest
            var videos = []
            var audios = []

            // get all video and audio streams
            for (let i = 0; i < streams.length; i++) {
                const element = streams[i];
                var ext = element.ext;
                var type = getStreamType(ext, element);
                if (type == "video"){
                    videos.push(element);
                }else if(type == "audio"){
                    audios.push(element);
                }   
            }

            // get the highest quality video and audio streams
            var highest_video = videos[0];
            var highest_audio = audios[0];
            for (let i = 0; i < videos.length; i++) {
                const element = videos[i];
                if (element.height > highest_video.height){
                    highest_video = element;
                }
            }

            for (let i = 0; i < audios.length; i++) {
                const element = audios[i];
                if (element.abr > highest_audio.abr){
                    highest_audio = element;
                }
            }

            // remove all other streams
            for (let i = 0; i < streams.length; i++) {
                const element = streams[i];
                if (element != highest_video && element != highest_audio){
                    streams.splice(i, 1);
                }
            }

            var streams_html = "";
            // just list each audio stream name
            var used_types = []
            for (let i = 0; i < streams.length; i++) {
                const element = streams[i];
                var ext = element.ext;

                // get a type: audio or video

                var type = getStreamType(ext, element);
                var stream_object = {
                    type: type,
                    ext: ext,
                    bitrate: element.abr,
                    url: element.url ,
                    width: element.width,
                    height: element.height,
                }

                // add to list if not already added
                if (!used_types.includes(stream_object.type)){
                    used_types.push(stream_object.type);
                    // add to html, stringify the object and keep the readable information
                    if (stream_object.type == "audio"){
                        streams_html += `<li data='${btoa(JSON.stringify(stream_object))}'>${stream_object.type} - ${stream_object.ext} (${stream_object.bitrate} kbps)</li>`;
                    
                    }
                    else{
                        streams_html += `<li data='${btoa(JSON.stringify(stream_object))}'>${stream_object.type} - ${stream_object.ext} (${stream_object.width}x${stream_object.height})</li>`;
                    }
                }


            }
            add_info_item("Highest Quality Streams", `<ul>${streams_html}</ul>`);
            

            // create a combobox with all the streams
            var cb_data = {
                options: [],   
            }
            for (let i = 0; i < audios.length; i++) {
                const element = audios[i];
                // get a readable name
                if (element.abr != undefined){
                    var readable_name = `${element.ext} (${element.abr} kbps)`;
                    cb_data.options.push({
                        name: readable_name,
                        data: element.url,
                    });
                }
                else{
                    var readable_name = `${element.ext} (${element.width}x${element.height})`;
                    cb_data.options.push({
                        name: readable_name,
                        data: element.url,
                    });
                }
            }
            cb_data['default'] = 0;
            cb_data['id'] = "download-media";
            add_info_item("Download", cb_data);

        }

        // Controls test cases
        // add_info_item("button test", `<button class="normal">Test</button>`);
        // add_info_item("combo test", {
        //     id: "combo-test",
        //     default: 0,
        //     options: ["test", "test2", "test3"]
        // });

        
    })
})

