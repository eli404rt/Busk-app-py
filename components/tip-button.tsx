"use client"

import { useEffect } from "react"

interface TipButtonProps {
  className?: string
}

export function TipButton({ className = "" }: TipButtonProps) {
  useEffect(() => {
    // Add the script functionality
    const showCheckoutWindow = (e: Event) => {
      e.preventDefault()
      const target = e.target as HTMLAnchorElement
      const url = target.getAttribute("data-url")
      if (!url) return

      const title = "Square Payment Links"
      const topWindow = window.top ? window.top : window
      const dualScreenLeft = topWindow.screenLeft !== undefined ? topWindow.screenLeft : topWindow.screenX
      const dualScreenTop = topWindow.screenTop !== undefined ? topWindow.screenTop : topWindow.screenY
      const width = topWindow.innerWidth
        ? topWindow.innerWidth
        : document.documentElement.clientWidth
          ? document.documentElement.clientWidth
          : screen.width
      const height = topWindow.innerHeight
        ? topWindow.innerHeight
        : document.documentElement.clientHeight
          ? document.documentElement.clientHeight
          : screen.height
      const h = height * 0.75
      const w = 500
      const systemZoom = width / topWindow.screen.availWidth
      const left = (width - w) / 2 / systemZoom + dualScreenLeft
      const top = (height - h) / 2 / systemZoom + dualScreenTop
      const newWindow = window.open(
        url,
        title,
        `scrollbars=yes, width=${w / systemZoom}, height=${h / systemZoom}, top=${top}, left=${left}`,
      )
      if (window.focus && newWindow) newWindow.focus()
    }

    const button = document.getElementById("embedded-checkout-modal-checkout-button")
    if (button) {
      button.addEventListener("click", showCheckoutWindow)
      return () => button.removeEventListener("click", showCheckoutWindow)
    }
  }, [])

  return (
    <div className={className}>
      <div
        style={{
          overflow: "auto",
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-end",
          alignItems: "center",
          width: "259px",
          background: "#FFFFFF",
          border: "1px solid rgba(0, 0, 0, 0.1)",
          boxShadow: "-2px 10px 5px rgba(0, 0, 0, 0)",
          borderRadius: "10px",
          fontFamily: "SQ Market, SQ Market, Helvetica, Arial, sans-serif",
        }}
      >
        <div style={{ padding: "20px" }}>
          <a
            id="embedded-checkout-modal-checkout-button"
            target="_blank"
            data-url="https://square.link/u/HrVNnyeo?src=embd"
            href="https://square.link/u/HrVNnyeo?src=embed"
            style={{
              display: "inline-block",
              fontSize: "18px",
              lineHeight: "48px",
              height: "48px",
              color: "#000000",
              minWidth: "212px",
              backgroundColor: "#ff9f40",
              textAlign: "center",
              boxShadow: "0 0 0 1px rgba(0,0,0,.1) inset",
              borderRadius: "50px",
              textDecoration: "none",
            }}
            rel="noreferrer"
          >
            Tip Jar
          </a>
        </div>
      </div>
    </div>
  )
}
