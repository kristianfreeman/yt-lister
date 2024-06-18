import type { MetaFunction } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { json } from "@remix-run/node";

import config from "../../config"

import { google } from 'googleapis';
const Youtube = google.youtube({
  version: 'v3',
  auth: process.env.YOUTUBE_API_KEY
})

export async function loader() {
  const apiResponse = await Youtube.search.list({
    channelId: config.channel_id,
    maxResults: 50,
    order: "date",
    part: ["snippet"],
  })

  const items = apiResponse?.data?.items

  if (!items) return json({ videos: [] })

  const videos = items.filter(searchResult => {
    return searchResult?.id?.kind == "youtube#video"
  })

  return json({ videos })
}

export const meta: MetaFunction = () => {
  return [
    { title: config.title },
    { name: "description", content: config.description },
  ];
};

const Video = ({ pinned, video }) => {
  const { id: { videoId } } = video
  const { title, description, thumbnails } = video.snippet
  const { url: thumbnail_url } = thumbnails.high
  const video_url = `https://youtube.com/watch?v=${videoId}`

  return pinned ? (
    <div className="card w-full bg-base-100 shadow-xl">
      <figure><img className="w-full" src={thumbnail_url} alt={title} /></figure>
      <div className="card-body">
        <h2 className="card-title">
          📌 {decodeURIComponent(title)}
        </h2>
        <p>{description}</p>
        <div className="card-actions justify-end">
          <a className="btn btn-primary" href={video_url} target="_blank">Watch on YouTube</a>
        </div>
      </div>
    </div>
  ) : (
    <a className="card bg-base-100 shadow-xl" href={video_url} target="_blank">
      <div className="card-body">
        <h2 className="card-title">📹 {title}</h2>
      </div>
    </a>
  )
}

export default function Index() {
  const { videos } = useLoaderData<typeof loader>()

  const pinned = videos.filter(video => config.pinned_videos.includes(video?.id?.videoId))
  const otherVideos = videos.filter(video => !video?.snippet?.pinned)

  return (
    <div className="max-w-2xl mx-auto py-8">
      <div className="text-center">
        <div>
          <h1 className="text-5xl font-bold">
            {config.title}
          </h1>
          <p className="py-6">
            {config.description}
          </p>
          <a className="btn text-white" style={{ background: "#FF0000" }} href={`https://youtube.com/channel/${config.channel_id}?sub_confirmation=1`} target="_blank">
            <svg className="w-4 h-4 fill-white" role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><title>YouTube</title><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" /></svg>
            Subscribe on YouTube
          </a>
        </div>
      </div>

      <div className="font-sans p-4 flex flex-col gap-4">
        {pinned.map(video => <Video key={video.id.videoId} pinned video={video} />)}
        {otherVideos.map(video => <Video key={video.id.videoId} video={video} />)}
      </div>
    </div>
  );
}
