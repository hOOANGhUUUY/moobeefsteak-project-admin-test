import React from "react";
import YouTubeEmbed from "./YouTubeEmbed";
import ComponentCard from "@/components/common/ComponentCard";

export default function VideosExample() {
  return (
    <div>
      <div className="grid grid-cols-1 gap-5 sm:gap-6 xl:grid-cols-2">
        <div className="space-y-5 sm:space-y-6">
          <ComponentCard>
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Video Ratio 16:9</h2>
              <YouTubeEmbed videoId="dQw4w9WgXcQ" />
            </div>
          </ComponentCard>
          <ComponentCard>
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Video Ratio 4:3</h2>
              <YouTubeEmbed videoId="dQw4w9WgXcQ" aspectRatio="4:3" />
            </div>
          </ComponentCard>
        </div>
        <div className="space-y-5 sm:space-y-6">
          <ComponentCard>
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Video Ratio 21:9</h2>
              <YouTubeEmbed videoId="dQw4w9WgXcQ" aspectRatio="21:9" />
            </div>
          </ComponentCard>
          <ComponentCard>
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Video Ratio 1:1</h2>
              <YouTubeEmbed videoId="dQw4w9WgXcQ" aspectRatio="1:1" />
            </div>
          </ComponentCard>
        </div>
      </div>
    </div>
  );
}
