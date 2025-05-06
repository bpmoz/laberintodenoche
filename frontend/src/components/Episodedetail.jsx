import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";

const EpisodeDetail = () => {
  const { id } = useParams();
  const [episode, setEpisode] = useState(null);
  const [spotifyData, setSpotifyData] = useState(null);
  const [youtubeData, setYoutubeData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("spotify");

  useEffect(() => {
    fetch(`http://localhost:3002/api/episodes/${id}`)
      .then((response) => {
        if (!response.ok) throw new Error("Episode not found");
        return response.json();
      })
      .then((episodeData) => {
        setEpisode(episodeData);

        if (episodeData.spotifyId) {
          return fetchSpotifyData(episodeData.spotifyId);
        }
      })
      .then((spotifyData) => {
        if (spotifyData) setSpotifyData(spotifyData);

        if (episode && episode.youtubeId) {
          return fetchYoutubeData(episode.youtubeId);
        }
      })
      .then((youtubeData) => {
        if (youtubeData) setYoutubeData(youtubeData);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching episode data:", error);
        setLoading(false);
      });
  }, [id]);

  const fetchSpotifyData = async (spotifyId) => {
    const response = await fetch(
      `https://api.spotify.com/v1/episodes/${spotifyId}`,
      {
        headers: {
          Authorization: "Bearer YOUR_SPOTIFY_ACCESS_TOKEN",
        },
      }
    );

    if (!response.ok) throw new Error("Failed to fetch Spotify data");
    return response.json();
  };

  const fetchYoutubeData = async (youtubeId) => {
    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?id=${youtubeId}&part=snippet,contentDetails&key=YOUR_YOUTUBE_API_KEY`
    );

    if (!response.ok) throw new Error("Failed to fetch YouTube data");
    return response.json();
  };

  if (loading) {
    return <div className="episode__loading">Loading episode...</div>;
  }

  if (!episode) {
    return <div className="episode__error">Episode not found</div>;
  }

  const spotifyEmbedUrl = `https://open.spotify.com/embed/episode/${episode.spotifyId}`;
  const youtubeEmbedUrl = `https://www.youtube.com/embed/${episode.youtubeId}`;

  return (
    <div className="episode">
      {}
      <div className="episode__player">
        <div className="episode__tabs">
          <button
            className={`episode__tab ${
              activeTab === "spotify" ? "episode__tab--active" : ""
            }`}
            onClick={() => setActiveTab("spotify")}
          >
            Listen on Spotify
          </button>
          <button
            className={`episode__tab ${
              activeTab === "youtube" ? "episode__tab--active" : ""
            }`}
            onClick={() => setActiveTab("youtube")}
          >
            Watch on YouTube
          </button>
        </div>

        <div className="episode__player-container">
          {activeTab === "spotify" && (
            <iframe
              className="episode__spotify-iframe"
              src={spotifyEmbedUrl}
              width="100%"
              height="232"
              frameBorder="0"
              allowtransparency="true"
              allow="encrypted-media"
              title="Spotify Player"
            ></iframe>
          )}

          {activeTab === "youtube" && (
            <iframe
              className="episode__youtube-iframe"
              width="100%"
              height="315"
              src={youtubeEmbedUrl}
              title="YouTube video player"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          )}
        </div>
      </div>

      {}
    </div>
  );
};

export default EpisodeDetail;
