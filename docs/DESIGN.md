# Design Document

> Written by: Jacob Gogel, Wyatt Smith, Shashank Vanga, Jayden Jang for COMP 426: Modern Web Programming at UNC-Chapel Hill.

## Feature Plan

*Replace this with your feature plan. Write a bit more detail under each heading from before (description, user, purpose). Also, add a fourth section to each with some technical notes on how you may implement each feature and any other backend or frontend notes you may need.*

### Feature 1: Live Bidding

**Description:** This feature allows users to place bids on items in real-time. The UI will display the current highest bid, along with the entire bid history of the users. Users should also be able to place a completely new bid at any instant. 

**User(s):** All authenticated users (bidders)

**Purpose:** This feature will allow for competitive bidding, and the real-time updates will let the users be more involved and encourage a more responsive bidding experience to buy items.

**Technical Notes:**
Frontend can use Supabase real time to receive live updates on the auction
Backend will have to validate new bids and then store them in the database, while making sure they fall within the time constraints if the auction
Postgres triggers for auction bidlogic  will update the current highest bid or notify previous highest bidder
Policy would ensure only logged-in users can place bids on open auctions.

### Feature 2: Live product listing

**Description:** Enables sellers to create live auction listings with item details such as title, description, starting price, and end time. Listings appear on the platform immediately upon submission and are visible to all users.

**User(s):** All authenticated users (sellers)

**Purpose:** This feature will allow users to add product listings to the auction platform, and make new auction rules based on their own preferences. 

**Technical Notes:**
Supabase Realtime notifies clients of new entries in auction_item.
Backend stores listing data
Sellers can only manage their own listings


### Feature 3: Notifications

**Description:** Users should get a notification when their existing bid has been outbid, or if they win an auction, and (potentially) when a new listing has been added through popups and the notification board.

**User(s):** All authenticated users (buyers and sellers)

**Purpose:** This feature will allow users to react faster to real-time changes in the auction, while staying engaged throughout the whole process.

**Technical Notes:** Frontend would work on the different notification alerts on outbid/new items/auction results.
Backend would use triggers to insert row into notification table on key events

### Feature 4: History

**Description:** Provides users with a personalized log of their auction activity. Users can see a history of items they’ve bid on (won or lost), and items they’ve sold. Includes timestamps and outcomes for transparency and recordkeeping.

**User(s):** All Users (Bidders and Sellers)

**Purpose:** To help users track their participation and performance in auctions over time, providing clarity and simplified listing.

**Technical Notes:** Frontend would display past bids, auction results
Backend would append events automatically on bid placements/auction end.


### Feature 5: Authentication

**Description:** Uses secure sign-up and login functionality (Supabase Auth) to register users and manage sessions. Each user has a profile containing display name, avatar, and username. Authentication is required to bid, list, and view personal auction history.

**User(s):** All Users (Bidders and Sellers)

**Purpose:** To ensure secure access to the platform and enable personalized features based on user identity.

**Technical Notes:** Supabase Auth handles user sign-up/login with email+password 
User data will be stored in profile table linked profile.id=auth.id
Any activity without login would send the user to sign up/log in page


## Backend Database Schema

https://imgur.com/a/LQqkUSf

## High-Fidelity Prototype

https://www.figma.com/design/3ZMlCclSfMJ4qnqgEhkYil/shadcn-ui---Team-21---Prototype?node-id=4704-1365&t=GSCQypEXs1hk82vi-1
