'use client'
import React from 'react'
import Link from "next/link";
import Image from "next/image"
import { VideoCardProps } from "@/constants";
const VideoCard = ({
    id,
    username,
    title,
    thumbnail,
    userImg,
    createdAt,
    views,
    visibility,
    duration
                   }: VideoCardProps) => {
    return (
        <Link href={`/video/${id}`} className="video-card">
            <Image src={thumbnail} alt="thumbnail" width={500} height={450} className="rounded-lg object-cover" />
            <article>
                <div>
                    <figure>
                        <Image src={userImg} alt="avatar" width={34} height={34} className="rounded-full aspect-square" />
                        <figcaption>
                            <h3>{username}</h3>
                            <p>{visibility}</p>
                        </figcaption>
                    </figure>
                    <aside>
                        <Image src="/assets/icons/eye.svg" alt="views" width={16} height={16}/>
                        <span>{views}</span>
                    </aside>
                </div>
                <h2>
                    {title} -{" "}
                    {createdAt.toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                    })}
                </h2>
            </article>
            <button onClick={()=> {}} className="copy-btn" >
                <Image src="/assets/icons/link.svg" alt="copy" width={18} height={18}/>
            </button>
            {duration &&(
                <div className="duration">
                    {Math.ceil(duration / 60)}min
                </div>
            )}
        </Link>
    )
}
export default VideoCard
