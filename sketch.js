const CLIENT_ID = "61aef2b1";

const moods = {
    happy: ["pop", "upbeat", "energetic"],
    sad: ["melancholic", "emotional", "heavy"],
    dreamy: ["dream", "ballad", "hopeful"],
    angry: ["dark", "metal", "rock"],
    romantic: ["romantic", "dramatic", "soft"],
    nostalgic: ["retro", "instrumental", "jazz"],
    focus: ["instrumental", "mellow", "ambient"],
    relaxed: ["melodic", "meditative","relaxing"],
    excited: ["energetic", "uplifting", "groovy"]
};

function setup() {
    noCanvas();

    const button = select("#searchButton");

    button.mousePressed(searchMood);

    select("#moodInput").elt.addEventListener("keydown", function(e) {
        if (e.key === "Enter") {
            searchMood();
        }
    });
}


async function searchMood() {

    let mood = select("#moodInput").value()
        .toLowerCase()
        .trim();

    if (!mood) {
        select("#message").html("Please enter a mood first!");
        return;
    }

    let tags = moods[mood];

    if (!tags) {
        tags = [mood];
    }

    select("#message").html("Finding music for your mood...");
    select("#playlist").html("");
    select("#playlistTitle").html("");

    try {
        let songs = await getSongs(tags);

        if (songs.length < 5) {
            songs = await getSongs([tags[0]]);
        }

        if (songs.length === 0) {
            select("#message").html(
                "No songs found. Try another mood!"
            );
            return;
        }

        displayPlaylist(songs, mood);

    } catch (error) {
        console.error(error);

        select("#message").html(
            "Something went wrong. Please try again."
        );
    }
}


async function getSongs(tags) {

    const url = new URL(
        "https://api.jamendo.com/v3.0/tracks/"
    );

    url.search = new URLSearchParams({
        client_id: CLIENT_ID,
        format: "json",
        limit: "5",
        fuzzytags: tags.join(" "),
        audioformat: "mp31",
        imagesize: "300",
        groupby: "artist_id"
    });

    const response = await fetch(url);

    if (!response.ok) {
        throw new Error("Jamendo API request failed");
    }

    const data = await response.json();

    if (data.headers.status !== "success") {
        throw new Error(data.headers.error_message);
    }

    return data.results;
}

function displayPlaylist(songs, mood) {

    select("#message").html(
        "Here is your soundtrack for today."
    );

    select("#playlistTitle").html(
        "A playlist for when you're feeling " + mood
    );

    let playlist = select("#playlist");

    songs.slice(0, 5).forEach(function(song, index) {

        let card = createDiv();
        card.addClass("song");

        let image = createImg(
            song.image,
            song.name
        );

        image.parent(card);

        let title = createElement("h3", song.name);
        title.parent(card);

        let artist = createP(song.artist_name);
        artist.parent(card);

        let audio = createElement("audio");
        audio.attribute("src", song.audio);
        audio.attribute("preload", "none");

        let playButton = createButton("▶ Play");
        playButton.mousePressed(function() {
            if (audio.elt.paused) {
                audio.elt.play();
                playButton.html("⏸ Pause");
            } else {
                audio.elt.pause();
                playButton.html("▶ Play");
            }
        });

        playButton.parent(card);

        let source = createElement("source");
        source.attribute("src", song.audio);
        source.attribute("type", "audio/mpeg");

        source.parent(audio);
        audio.parent(card);

        let number = createP("#" + (index + 1));
        number.parent(card);

        card.parent(playlist);
    });

    select("#message").html(
        "Enjoy your playlist!"
    );
}
