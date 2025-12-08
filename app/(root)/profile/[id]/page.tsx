import React from 'react'
import Header from "@/components/SharedHeader";
import {dummyCards} from "@/constants";
import VideoCard from "@/components/VideoCard";
import {ParamsWithSearch} from "@/index";

const Page = async ({params}:ParamsWithSearch) => {
    const {id}=await params;
    return (
        <div className="wrapper page">
            <Header subHeader="aniveshparida8@gmail.com" title="ANIVESH PARIDA" userImg="/assets/images/dummy.jpg"/>
           <section className="video-grid">
               {dummyCards.map((card)=>(<VideoCard key={card.id} {...card} />))}
           </section>

        </div>
    )
}
export default Page
