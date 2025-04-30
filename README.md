# HeelBid

> Developed by [Wyatt Smith, Shashank Vanga, Jayden Jang, Jacob Gogel]() for COMP 426: Modern Web Programming at UNC-Chapel Hill.

![TypeScript](https://img.shields.io/badge/-TypeScript-05122A?style=flat&logo=typescript)
![Next.js](https://img.shields.io/badge/-Next.js-05122A?style=flat&logo=nextdotjs)
![Shadcn/ui](https://img.shields.io/badge/-Shadcn_UI-05122A?style=flat&logo=shadcnui)
![Tailwind](https://img.shields.io/badge/-Tailwind-05122A?style=flat&logo=tailwindcss)
![Supabase](https://img.shields.io/badge/-Supabase-05122A?style=flat&logo=supabase)

Welcome to HeelBid! A realtime auction website where users can buy and sell items!

<img width="500" alt="Screenshot 2025-04-27 at 7 44 05 PM" src="https://github.com/user-attachments/assets/8baf701b-b939-47af-919a-3454cf1d8dbc" />
<img width="500" alt="Screenshot 2025-04-27 at 7 44 30 PM" src="https://github.com/user-attachments/assets/0036b346-02f3-4fc9-bbeb-8c4a93c0c91d" />

## Features

<h3><b>Live Bidding<b></h3>

This feature allows users to place bids on items in real-time. The UI will display the current highest bid, along with the entire bid history of the users. Users should also be able to place a completely new bid at any instant.

<h3><b>Live product listing<b></h3>
Enables sellers to create live auction listings with item details such as title, description, starting price, and end time. Listings appear on the platform immediately upon submission and are visible to all users.

<h3><b>Notifications<b></h3>
Users should get a notification when their existing bid has been outbid, or if they win an auction, and (potentially) when a new listing has been added through popups and the notification board.

<h3><b>History<b></h3>
Provides users with a personalized log of their auction activity. Users can see a history of items they’ve bid on (won or lost), and items they’ve sold. Includes timestamps and outcomes for transparency and recordkeeping.

<h3><b>Authentication<b></h3>
Uses secure sign-up and login functionality (Supabase Auth) to register users and manage sessions. Each user has a profile containing display name, avatar, and username. Authentication is required to bid, list, and view personal auction history.

<h3><b>Live Viewer Count</b></h3> 
Displays the number of users currently viewing each auction in real-time. This feature helps create a sense of urgency and competition by showing bidders how many others are interested in the same item. Viewer data updates live without requiring a page refresh.
