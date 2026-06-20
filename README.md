# Pablings Barbershop - Premium Barber Shop Demo

This project is a modern, responsive web application for a premium barber shop. It provides a polished user interface for customers to view services, register as walk-ins, and seamlessly book appointments online. 

Built with **Next.js 16**, **React 19**, **Tailwind CSS v4**, **Redux Toolkit**, and **Framer Motion**, it demonstrates a high-end dark mode aesthetic using "glassmorphism" design principles.

---

## 📖 Pages & Functionality

### 1. Home Page (`/`)
The landing page serves as the digital storefront. 
- **Functionality**: Provides a high-impact hero section to draw users in. Contains direct "Calls to Action" (CTAs) directing users to either book an appointment or register as a walk-in.
- **Logic / Tech**: Utilizes `framer-motion` for entrance animations and infinite background rotating elements. The layout is fully responsive, ensuring decorative elements don't overwhelm mobile screens.

### 2. Services Page (`/services`)
Displays the catalog of grooming services offered by the shop.
- **Functionality**: Lists out services in a responsive grid, showing the price, duration, and a brief description of each service.
- **Logic / Tech**: Reads the service list directly from the global **Redux Store** (`state.services.items`). It dynamically renders icons for each service using `lucide-react` based on the icon name string stored in the state. 

### 3. Register Page (`/register`)
A form designed for walk-in customers or first-time visitors to create an account or get in the queue.
- **Functionality**: Captures the user's First Name, Last Name, Phone Number, and Email. Upon submission, it shows a loading state, followed by a success screen displaying a simulated queue number.
- **Logic / Tech**: Uses local React state to manage form inputs and loading status. When submitted, it dispatches the `registerUser` action to the Redux store to persist the user's profile and updates the UI to show the success confirmation via `AnimatePresence` from Framer Motion.

### 4. Book Appointment (`/book`)
A multi-step, interactive booking wizard.
- **Functionality**: Guides the user through a 4-step process to secure an appointment.
  - **Step 1 (Service)**: Select a service from the list.
  - **Step 2 (Time)**: Pick an available time slot.
  - **Step 3 (Payment)**: Choose between a 50% downpayment or paying in full upfront. 
  - **Step 4 (Confirmation)**: Displays a digital receipt with the booking details and amount paid.
- **Logic / Tech**: Manages the current wizard step using local React state (`step`). Every time a user makes a selection, it dispatches actions to the Redux store (`selectService`, `selectDateTime`, `setPaymentType`) to build the final booking object. Mathematical logic is used in Step 3 to automatically calculate the 50% downpayment based on the selected service's price in the Redux store.

---

## 🛠 State Management & Architecture

The application relies on **Redux Toolkit** for predictable state management across the app:
- **`servicesSlice`**: Contains the static list of available barber services, prices, and durations.
- **`bookingSlice`**: Tracks the user's progress through the booking flow, storing the selected service ID, time, and calculated payment amounts.
- **`userSlice`**: Manages the authentication/registration state, storing the user's profile details once they register.

All pages are wrapped in a `<StoreProvider>` within the Next.js `layout.tsx` to ensure the global state is accessible everywhere.

## 🎨 Styling & Animations
- **Tailwind CSS**: Used for all layout, typography, and responsive design. Custom `.glass` and `.glass-dark` utility classes are defined in `globals.css` to achieve the frosted glass aesthetic.
- **Framer Motion**: Used extensively for micro-interactions (button scales), page transitions, and the step-by-step unmounting/mounting of form elements using `<AnimatePresence>`. 
- **Responsiveness**: The entire application is mobile-first, ensuring grids collapse into single columns, navbars condense into hamburger menus, and paddings adjust dynamically for smaller devices.

## 🚀 Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```
2. Run the development server:
   ```bash
   npm run dev
   ```
3. Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.
