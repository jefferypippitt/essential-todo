"use client";

import * as React from "react";
import Link from "next/link";
import { ModeToggle } from "./theme-toggle";
import { MaxWidthWrapper } from "./max-width-wrapper";

export function Header() {
  return (
    <header className="w-full z-40 fixed top-0 left-0 bg-background border-b">
      <MaxWidthWrapper>
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/" className="font-semibold">
              Home
            </Link>
          </div>

          <div className="flex items-center gap-4">
            <ModeToggle />
          </div>
        </div>
      </MaxWidthWrapper>
    </header>
  );
}
