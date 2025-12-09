"use client";
import { useMemo, useState } from "react";
import { parseTranscript } from "@/lib/utils";
import { infos } from "@/constants";

type VideoInfoProps = {
  transcript: string;
  title: string;
  createdAt: Date;
  description: string;
  videoUrl: string;
};

const VideoInfo = ({ transcript, title, createdAt, description, videoUrl }: VideoInfoProps) => {
  const [active, setActive] = useState<string>(infos[0]);

  const parsed = useMemo(() => parseTranscript(transcript), [transcript]);

  return (
    <aside className="video-info">
      <nav className="info-tabs">
        {infos.map((tab) => (
          <button
            key={tab}
            className={`tab ${active === tab ? "active" : ""}`}
            onClick={() => setActive(tab)}
          >
            {tab}
          </button>
        ))}
      </nav>

      {active === "transcript" ? (
        <section className="transcript">
          {parsed.length === 0 ? (
            <p>No transcript available.</p>
          ) : (
            <ul>
              {parsed.map((entry, idx) => (
                <li key={`${entry.time}-${idx}`}>
                  <span className="time">{entry.time}</span>
                  <p className="text">{entry.text}</p>
                </li>
              ))}
            </ul>
          )}
        </section>
      ) : (
        <section className="metadata">
          <h3>{title}</h3>
          <p>{description}</p>
          <p className="meta">{createdAt.toLocaleString()}</p>
          <a href={videoUrl} target="_blank" rel="noreferrer">Open video</a>
        </section>
      )}
    </aside>
  );
};

export default VideoInfo;
