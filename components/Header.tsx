import Link from "next/link";
import React from 'react';
import { ICONS } from "@/constants";
import DropdownList from "@/components/DropdownList";
import {SharedHeaderProps} from "@/index";

const Header = ({ subHeader, title, userImg }: SharedHeaderProps) => {
    return (
        <header className="header">
            <section className="header-container">
                <div className="details">
                    {userImg && (
                        <img
                            src={userImg || '/assets/images/dummy.jpg'}
                            alt="user"
                            width={66}
                            height={66}
                            className="rounded-full"
                        />
                    )}
                    <article>
                        <p>{subHeader}</p>
                        <h1>{title}</h1>
                    </article>
                </div>

                <aside>
                    <Link href="/upload" className="flex items-center gap-2">
                        <img src="/assets/icons/upload.svg" alt="upload" width={16} height={16} />
                        <span>Upload a video</span>
                    </Link>

                    <div className="record">
                        <button className="primary-btn">
                            <img src={ICONS.record} alt="record" width={16} height={16} />
                            <span>Record a video</span>
                        </button>
                    </div>
                </aside>
            </section>

            <section className="search-filter">
                <div className="search">
                    <input
                        type="text"
                        placeholder="Search for videos, tags, folders..."
                    />
                    <img src="/assets/icons/search.svg" alt="search" width={16} height={16} />
                </div>
                {/* Replace this with actual component */}
                <DropdownList />
            </section>
        </header>
    );
};

export default Header;
