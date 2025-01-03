"use client";
import { useState, useEffect, ChangeEvent } from "react";
import styles from "./index.module.css";

const Home = () => {
  const [designData, setDesignData] = useState<{
    themes: {
      primary: string;
      secondary: string;
      accent: string;
      background: string;
      text: string;
    }[];
    names: string[];
    seed: { url: string; query: string };
  }>({ themes: [], names: [], seed: { url: "", query: "" } });
  const [pageName, setPageName] = useState<string>("");
  const [videoUrl, setVideoUrl] = useState<string>("");
  const [keywords, setKeywords] = useState<string>("");

  useEffect(() => {
    // Fetch the static file on load
    const fetchData = async () => {
      const response = await fetch("/design.json");
      const result = await response.json();
      setDesignData(result);

      // Set the page name
      const randomName =
        result.names[Math.floor(Math.random() * result.names.length)];
      setPageName(randomName);

      // set seed
      setVideoUrl(result.seed.url);
      setKeywords(result.seed.query);
    };

    fetchData();
  }, []);

  const [segments, setSegments] = useState<
    Array<{ start: number; end: number; text: string }>
  >([]);
  const [loading, setLoading] = useState<boolean>(false);

  const handleGenerate = async () => {
    setLoading(true);
    setSegments([]);
    const response = await fetch(
      `/api/supercut?videoUrl=${encodeURIComponent(
        videoUrl
      )}&keywords=${encodeURIComponent(keywords)}`
    );

    if (response.ok) {
      const data = await response.json();
      setSegments(data.segments || []);
    } else {
      alert("Error fetching supercuts.");
    }
    setLoading(false);
  };

  const handleVideoUrlChange = (e: ChangeEvent<HTMLInputElement>) =>
    setVideoUrl(e.target.value);
  const handleKeywordsChange = (e: ChangeEvent<HTMLInputElement>) =>
    setKeywords(e.target.value);

  const getVideoId = (url: string) => {
    const urlObj = new URL(url);
    return urlObj.searchParams.get("v");
  };

  const playSegment = (start: number) => {
    const videoId = getVideoId(videoUrl);

    if (videoId) {
      const iframe = document.getElementById(
        "youtube-player"
      ) as HTMLIFrameElement;
      iframe.src = `https://www.youtube.com/embed/${videoId}?start=${Math.floor(
        start
      )}&autoplay=1&cc_lang_pref=en&cc_load_policy=1`;
    }
  };

  const changeTheme = () => {
    const colorThemes = designData.themes;
    const theme = colorThemes[Math.floor(Math.random() * colorThemes.length)];
    document.documentElement.style.setProperty(
      "--primary-color",
      theme.primary
    );
    document.documentElement.style.setProperty(
      "--secondary-color",
      theme.secondary
    );
    document.documentElement.style.setProperty("--accent-color", theme.accent);
    document.documentElement.style.setProperty(
      "--background-color",
      theme.background
    );
    document.documentElement.style.setProperty("--text-color", theme.text);
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>{pageName}</h1>
      <div className={styles.inputContainer}>
        <input
          className={styles.input}
          placeholder="Enter YouTube video URL"
          value={videoUrl}
          onChange={handleVideoUrlChange}
        />
        <input
          className={styles.input}
          placeholder="Enter keywords (comma-separated)"
          value={keywords}
          onChange={handleKeywordsChange}
        />
        <button
          className={styles.button}
          onClick={handleGenerate}
          disabled={loading}
        >
          {loading ? "loading..." : "roam"}
        </button>
      </div>

      {segments.length > 0 && (
        <div className={styles.supercutContainer}>
          <div className={styles.videoContainer}>
            <iframe
              id="youtube-player"
              width="560"
              height="315"
              src=""
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className={styles.video}
            ></iframe>
          </div>

          <div className={styles.segmentsContainer}>
            {segments.map((segment, index) => (
              <div
                key={index}
                className={styles.segment}
                style={
                  {
                    "--random-top": Math.random(),
                    "--random-left": Math.random(),
                    "--random-rotate": `${Math.random()}turn`,
                  } as React.CSSProperties
                }
                onClick={() => playSegment(segment.start)}
              >
                <p className={styles.segmentText}>{segment.text}</p>
              </div>
            ))}
          </div>
        </div>
      )}
      <div
        className={styles.themeButton}
        onClick={changeTheme}
        style={{
          top: `${Math.random() * 90}%`,
          left: `${Math.random() * 90}%`,
        }}
      >
        change theme
      </div>
    </div>
  );
};

export default Home;
