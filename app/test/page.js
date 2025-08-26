// import Image from "next/image";
// import React from "react";

// const CollaborationSection = () => {
//   return (
//     <section className="relative isolate overflow-hidden bg-[#0a1b3d] text-white">
//       {/* ---- TOP ARC (white overlay) ---- */}
//       <div
//         className="
//           pointer-events-none absolute inset-x-0
//           -top-[120px]  h-[220px]  md:-top-[160px] md:h-[260px]
//           z-0 bg-white
//         "
//         style={{
//           clipPath: "ellipse(120% 100% at 50% 0%)",
//         }}
//       />

//       {/* ---- CONTENT ---- */}
//       <div className="relative z-10 max-w-7xl mx-auto px-6 py-32 md:py-40 flex flex-col md:flex-row items-center justify-between gap-10">
//         <div className="flex-1 text-center md:text-left">
//           <h1 className="text-4xl md:text-6xl font-bold mb-6">
//             Advanced Tech, In Your Corner
//           </h1>
//           <p className="text-lg md:text-xl mb-8">
//             InteroBOT® emulates search engine crawlers, enabling our digital
//             marketing team to view your site just as search engines would.
//           </p>
//           <button className="bg-orange-600 hover:bg-orange-700 text-white uppercase font-semibold py-3 px-6 rounded-lg shadow-lg">
//             See More
//           </button>
//         </div>

//         <div className="flex-1 flex justify-center md:justify-end">
//           <div className="relative w-80 md:w-[28rem]">
//             <Image
//               width={800}
//               height={800}
//               src="https://res.cloudinary.com/dibooxmnd/image/upload/v1756125212/luxury-resort_nyjyfm.png"
//               alt="Monitor"
//               className="absolute -top-6 -left-6 w-full h-auto rounded-xl shadow-xl opacity-80"
//             />
//             <Image
//               width={800}
//               height={800}
//               src="https://res.cloudinary.com/dibooxmnd/image/upload/v1756125212/luxury-resort_nyjyfm.png"
//               alt="Data Visualization"
//               className="relative w-full h-auto rounded-xl shadow-2xl z-10"
//             />
//           </div>
//         </div>
//       </div>

//       {/* ---- BOTTOM ARC (white overlay) ---- */}
//       <div
//         className="
//           pointer-events-none absolute inset-x-0
//           -bottom-[120px] h-[220px] md:-bottom-[160px] md:h-[260px]
//           z-0 bg-white
//         "
//         style={{
//           clipPath: "ellipse(120% 100% at 50% 100%)",
//         }}
//       />
//     </section>
//   );
// };

// export default CollaborationSection;

// import Image from "next/image";
// import React from "react";
// const CollaborationSection = () => {
//   return (
//     <section className="relative isolate overflow-hidden bg-[#0a1b3d] text-white">
//       {" "}
//       {/* ---- TOP ARC (white overlay) ---- */}{" "}
//       <div
//         className=" pointer-events-none absolute inset-x-0 -top-[150px] h-[220px] md:-top-[160px] md:h-[260px] z-0 bg-white "
//         style={{ clipPath: "ellipse(150% 80% at 50% 120%)" }}
//       />{" "}
//       {/* ---- CONTENT ---- */}{" "}
//       <div className="relative z-10 max-w-7xl mx-auto px-6 py-32 md:py-40 flex flex-col md:flex-row items-center justify-between gap-10">
//         {" "}
//         <div className="flex-1 text-center md:text-left">
//           {" "}
//           <h1 className="text-4xl md:text-6xl font-bold mb-6">
//             {" "}
//             Advanced Tech, In Your Corner{" "}
//           </h1>{" "}
//           <p className="text-lg md:text-xl mb-8">
//             {" "}
//             InteroBOT® emulates search engine crawlers, enabling our digital
//             marketing team to view your site just as search engines would.{" "}
//           </p>{" "}
//           <button className="bg-orange-600 hover:bg-orange-700 text-white uppercase font-semibold py-3 px-6 rounded-lg shadow-lg">
//             {" "}
//             See More{" "}
//           </button>{" "}
//         </div>{" "}
//         <div className="flex-1 flex justify-center md:justify-end">
//           {" "}
//           <div className="relative w-80 md:w-[28rem]">
//             {" "}
//             <Image
//               width={800}
//               height={800}
//               src="https://res.cloudinary.com/dibooxmnd/image/upload/v1756125212/luxury-resort_nyjyfm.png"
//               alt="Monitor"
//               className="absolute -top-6 -left-6 w-full h-auto rounded-xl shadow-xl opacity-80"
//             />{" "}
//             <Image
//               width={800}
//               height={800}
//               src="https://res.cloudinary.com/dibooxmnd/image/upload/v1756125212/luxury-resort_nyjyfm.png"
//               alt="Data Visualization"
//               className="relative w-full h-auto rounded-xl shadow-2xl z-10"
//             />{" "}
//           </div>{" "}
//         </div>{" "}
//       </div>{" "}
//       {/* ---- BOTTOM ARC (white overlay) ---- */}{" "}
//       <div
//         className=" pointer-events-none absolute inset-x-0 -bottom-[120px] h-[220px] md:-bottom-[160px] md:h-[260px] z-0 bg-white "
//         style={{ clipPath: "ellipse(120% 90% at 50% 100%)" }}
//       />{" "}
//     </section>
//   );
// };
// export default CollaborationSection;

import React from "react";

const InteroDigital = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      {/* Navigation */}
      <nav className="max-w-7xl mx-auto flex justify-between items-center py-6">
        <div className="text-3xl font-bold text-indigo-800">intero</div>
        <div className="text-xl font-semibold text-indigo-800">DIGITAL</div>
        <div className="flex space-x-8 items-center">
          <a
            href="#about"
            className="text-indigo-700 hover:text-indigo-900 font-medium"
          >
            ABOUT
          </a>
          <a
            href="#services"
            className="text-indigo-700 hover:text-indigo-900 font-medium"
          >
            SERVICES
          </a>
          <a
            href="#technology"
            className="text-indigo-700 hover:text-indigo-900 font-medium"
          >
            TECHNOLOGY
          </a>
          <a
            href="#blog"
            className="text-indigo-700 hover:text-indigo-900 font-medium"
          >
            BLOG
          </a>
          <a
            href="#resources"
            className="text-indigo-700 hover:text-indigo-900 font-medium"
          >
            RESOURCES
          </a>
          <a
            href="#contact"
            className="text-indigo-700 hover:text-indigo-900 font-medium"
          >
            CONTACT US
          </a>
          <button className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-6 rounded-full">
            GET A QUOTE
          </button>
        </div>
      </nav>

      {/* Curved Hero Section */}
      <div className="relative max-w-7xl mx-auto mt-12">
        {/* Curved background with clip-path */}
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-700 rounded-tl-[100px] rounded-br-[100px] transform -skew-y-3 z-0"></div>

        <div className="relative z-10 py-16 px-12 flex flex-col items-start">
          <h1 className="text-5xl font-bold text-white mb-6">
            Advanced Tech, In Your Corner
          </h1>
          <p className="text-xl text-indigo-100 max-w-2xl mb-8 leading-relaxed">
            InteroBOT® emulates search engine crawlers, enabling our digital
            marketing team to view your site just as search engines would.
            It&apos;s our secret weapon for testing opportunities and more
            accurately forecasting search results.
          </p>
          <button className="bg-white text-indigo-700 hover:bg-indigo-50 font-bold py-3 px-8 rounded-full text-lg transition-all duration-300 transform hover:scale-105">
            SEE MORE
          </button>
        </div>
      </div>

      {/* Additional content section */}
      <div className="max-w-7xl mx-auto mt-20 grid grid-cols-1 md:grid-cols-2 gap-12">
        <div className="bg-white p-8 rounded-2xl shadow-lg">
          <h2 className="text-2xl font-bold text-indigo-800 mb-4">
            Our Technology
          </h2>
          <p className="text-gray-700">
            We leverage cutting-edge AI and machine learning to deliver superior
            digital marketing results for our clients.
          </p>
        </div>

        <div className="bg-white p-8 rounded-2xl shadow-lg">
          <h2 className="text-2xl font-bold text-indigo-800 mb-4">
            Our Approach
          </h2>
          <p className="text-gray-700">
            Data-driven strategies combined with creative solutions to help your
            business stand out in the digital landscape.
          </p>
        </div>
      </div>

      <footer className="max-w-7xl mx-auto mt-16 text-center text-indigo-700">
        <p>© 2023 Intero Digital. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default InteroDigital;
