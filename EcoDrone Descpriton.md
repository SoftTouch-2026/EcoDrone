# EcoDrone: Smart & Sustainable Campus Delivery System

---

## HIGH-LEVEL PROJECT DESCRIPTION

### The Challenge

Ashesi University is piloting **EcoDrone**, a sustainable drone-powered delivery system designed to transform how food and essential items move across campus. Graduate students will work as Agile software companies to design, build, and iterate a real-world, end-to-end cyber-physical system that integrates drones, sensors, mobile applications, web platforms, and intelligent algorithms.

### Project Context

- **Course:** Agile Software Engineering Methods (Graduate)
- **Duration:** 8 Weeks
- **Team Structure:** 3 Agile teams, referred to as Companies
- **Pedagogy:** Problem-Based Learning (PBL), Scrum, Continuous Delivery
- **Setting:** Ashesi University campus

---

## System Overview: EcoDrone

### Smart Quadcopter Drone

Each company contributes to a drone-enabled delivery ecosystem featuring:

- Quadcopter with long-range battery
- 3-D modelled delivery container capable of safely transporting:
  - Food & drinks
  - Laptops, tablets, mobile phones
  - Books, keys, and other essentials
- Embedded environmental sensors, including:
  - Temperature
  - Carbon Monoxide (CO)
  - Carbon Dioxide (CO₂)

### EcoDrone Mobile Application

A mobile app designed for Ashesi University users, enabling:

- Food ordering and item delivery from:
  - Akornor Cafeteria
  - Hallmark Cafeteria
  - Akofena Cafeteria
  - Essentials Shop
- On-campus delivery to any location
- Interactive visualizations showing:
  - Temperature, CO, and CO₂ readings per flight
  - Cumulative sensor data over time
- User-friendly, accessible, and inclusive design

### EcoDrone Web Platform (Admin Dashboard)

A web-based system for System Administrators, integrated with the sensor messaging server, providing:

- Drone management and monitoring
- Data analytics and visualizations
- Automated reports on:
  - Users and orders
  - Items delivered
  - Flight paths and durations
  - Sensor data trends
  - Item pickup and drop-off locations
- Secure access and role-based control

### Intelligent Self-Flying Algorithm

An automated decision-making engine that:

- Schedules and routes drones based on:
  - Food orders
  - Item delivery requests
  - Drone availability and battery life
- Optimizes:
  - Delivery time
  - Energy efficiency
  - Safety and reliability
- Continuously adapts based on real-time data

### Agile & PBL Focus

Each company will operate as a real Agile organization, practicing:

- Scrum ceremonies (Sprint Planning, Reviews, Retrospectives)
- User stories and product backlogs
- Continuous integration and testing
- Cross-functional collaboration
- Ethical, inclusive, and sustainable software design

### Learning Outcomes

By the end of 8 weeks, students will demonstrate the ability to:

- Engineer complex, data-driven software systems
- Integrate hardware, software, and analytics
- Apply Agile methods to real societal problems
- Deliver working software incrementally
- Communicate technical decisions clearly and professionally

---

**EcoDrone: Engineering Sustainability. Delivering Innovation. Flying Agile.**

*A Problem-Based Learning Project in Agile Software Engineering Methods*  
*Ashesi University*

---

## DETAILED PROJECT DESCRIPTION

### Problem-Based Learning (PBL) Prosit: The EcoDrone Delivery System

#### Anchor Problem Statement: Launching EcoDrone – A Race Against Time and Complexity

You are a newly formed, cross-functional Agile engineering team hired by Ashesi University's Innovation Hub. The university has ambitious plans to launch **EcoDrone**, a sustainable, automated campus delivery system, as a flagship project for its 20th-anniversary celebrations in **8 weeks**. A prototype quadcopter with sensor capabilities exists, and initial mockups for the mobile app and website have been designed. However, the codebase is minimal, the architecture is undefined, and the integration points are untested.

The Senior Management Committee, led by the project sponsor (your professor), has set a non-negotiable Minimum Viable Product (MVP) Go-Live date in **8 weeks**. The launch event will involve a live demonstration delivering items across campus to key stakeholders and the press.

Your team's mission is to build, test, and deploy the EcoDrone system using Agile Software Engineering Methods. You must navigate technical uncertainty (drone API stability, sensor data streaming), changing requirements (management keeps adding "one more small feature" for the demo), and operational risks (battery life, campus no-fly zones). Success is measured by a functional, safe, and demonstrable system at the end of Sprint 8.

**The Core Challenge:** How do you, as a team, apply Agile principles and practices to systematically deconstruct this overwhelming problem, manage stakeholder expectations, deliver incremental value each week, and adapt to unforeseen obstacles—all while maintaining high code quality and team morale?

---

## Detailed Problem Narrative & Backlog

### Project Backlog (Structured Epics & User Stories)

Stories are prioritized as **Must-Have (M)**, **Should-Have (S)**, **Could-Have (C)** for MVP.

#### EPIC 1: Core Drone Command & Safety Infrastructure (Foundation)

- **M-US1.1:** As a System Admin, I can register a new drone in the system with its unique ID, battery specs, and sensor configuration, so we can manage the fleet.
- **M-US1.2:** As a Drone, I can receive a basic "take-off to 10m," "fly to GPS coordinates," and "land" command from the server, so core movement is automated.
- **M-US1.3:** As an Administrative System, I can monitor and log each drone's battery level in real-time, so I can prevent flights when battery is below 20%.
- **S-US1.4:** As a System, I can enforce a predefined "geo-fence" campus boundary, so drones cannot fly outside the permitted area.

#### EPIC 2: User Ordering & Management (Mobile App - Customer Journey)

- **M-US2.1:** As a Student, I can create an account and log into the mobile app using my Ashesi email, so my identity is verified.
- **M-US2.2:** As a Student, I can browse a list of available vendors (Akornor, Hallmark, etc.) and their menu/items, so I can decide what to order.
- **M-US2.3:** As a Student, I can select an item, specify a delivery location (e.g., "CS Lab, Block 7"), and place an order, so I can receive the item.
- **M-US2.4:** As a Student, I can see the real-time status of my order ("Preparing," "In Transit," "Delivered"), so I know when to expect my delivery.
- **S-US2.5:** As a Student, I can view a simple visualization (e.g., a graph) of the temperature reading from the drone during my delivery flight, so I see the sensor data.

#### EPIC 3: Order Fulfilment & Delivery Algorithm (The "Brain")

- **M-US3.1:** As the System, when an order is placed, I can assign it to an available drone with sufficient battery, so deliveries can be dispatched.
- **M-US3.2:** As the System, I can calculate an optimal flight path (sequence of GPS waypoints) from the vendor to the delivery point, avoiding known obstacles.
- **S-US3.3:** As the System, if a drone's battery dips below 25% mid-flight, I can recalculate its path to the nearest charging station, so we prevent crashes.
- **C-US3.4:** As the System, I can batch two orders going to the same general area for a single drone, so we improve efficiency.

#### EPIC 4: Administrative Control & Data Visualization (Website)

- **M-US4.1:** As a System Admin, I can log into a secure website dashboard, so I can manage the system.
- **M-US4.2:** As a System Admin, I can see a list of all pending, active, and completed deliveries, so I can monitor operations.
- **S-US4.3:** As a System Admin, I can generate a weekly report of total items delivered per vendor, so I can analyze usage.
- **S-US4.4:** As a System Admin, I can view a dashboard showing real-time temperature, CO2 and CO levels from all active drones on a campus map, so I can monitor environmental data.

#### EPIC 5: Sensor Data Integration & Public Awareness

- **S-US5.1:** As a Student, on the app's "EcoData" tab, I can see an interactive line chart showing average campus temperature readings per day over the last week, collected by the drones.
- **C-US5.2:** As the System, I can tag sensor data with location metadata, so we can generate a heatmap of CO2 levels across campus.

---

## 8-Week Sprint Plan (Sprint-on-a-Page)

### Sprint 0 (Week 1): Inception & Foundation

- **Goal:** Form team, establish working agreement, understand the problem deeply, and create a potentially shippable technical foundation.
- **PBL Focus:** Problem scoping, identifying knowledge gaps (drone SDKs, real-time web sockets).
- **Sprint Backlog:** Set up Git repo, CI/CD pipeline, dev environment. Spike on drone API. Design system architecture. Define "Definition of Done."
- **Potential Shippable Increment:** A "Hello World" drone take-off/land commanded from a simple local server script.

### Sprint 1 (Week 2): Drone on a Leash

- **Goal:** Establish reliable, safe, basic drone control from the central system.
- **Sprint Backlog:** M-US1.1, M-US1.2, M-US1.3.
- **Increment:** Admin can register a drone via a CLI. System can send flight commands and log battery. Basic safety check active.

### Sprint 2 (Week 3): The First Order

- **Goal:** Enable a single, pre-defined user to place an order that triggers a drone flight.
- **Sprint Backlog:** M-US2.1, M-US2.3 (hardcoded vendor/item), M-US3.1.
- **Increment:** "Test Student" can log in, order "Water from Akornor," and see it assigned to a drone. (Integration: App -> Backend -> Drone Command).

### Sprint 3 (Week 4): The Customer Journey

- **Goal:** Fulfill a complete, real user journey with tracking and delivery.
- **Sprint Backlog:** M-US2.2, M-US2.4, M-US3.2.
- **Increment:** Any student can browse vendors, place an order, see its real-time status, and the drone flies a calculated path to deliver it.

### Sprint 4 (Week 5): Admin Takes Control

- **Goal:** Provide system administrators with operational visibility and control.
- **Sprint Backlog:** M-US4.1, M-US4.2, S-US1.4 (Geo-fence).
- **Increment:** Secure admin website is live. Admin can see all deliveries and drones. Geo-fence safety is implemented.

### Sprint 5 (Week 6): Data & Efficiency

- **Goal:** Introduce data visualization and enhance system intelligence.
- **Sprint Backlog:** S-US2.5, S-US4.3, S-US3.3 (Battery Safety).
- **Increment:** Users see temp graphs for their flight. Admin can generate a delivery report. System handles low-battery rerouting.

### Sprint 6 (Week 7): Scaling & Awareness

- **Goal:** Handle multiple orders and request for items, and showcase the environmental mission.
- **Sprint Backlog:** C-US3.4 (Batching), S-US5.1, S-US4.4 (Real-time sensor dashboard).
- **Increment:** System can batch two orders. Public EcoData tab is live. Admin has a real-time environmental monitoring dashboard.

### Sprint 7 (Week 8): MVP Polish & Demo Prep

- **Goal:** Stabilize the MVP, fix critical bugs, and prepare for the final live demonstration.
- **Sprint Backlog:** Bug fixes, performance tuning, security review, demo script creation.
- **Increment:** A robust, demo-ready EcoDrone MVP. Release to Production.

### Sprint 8 (Final Week): Demo & Retrospective

- **Activity:** Live MVP demonstration to "stakeholders." Final team retrospective and submission of project portfolio (code, documentation, sprint reviews, reflection).

---

**All the best!**
