import React, { useState, useEffect, useCallback } from "react";

const HeroBanner = ({ movies, currentMood }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Featured movies (top rated)
  const featuredMovies = movies
    .slice()
    .sort((a, b) => b.rating - a.rating)
    .slice(0, 5);

  const currentMovie = featuredMovies[currentIndex] || movies[0];

  const handleNext = useCallback(() => {
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev === featuredMovies.length - 1 ? 0 : prev + 1));
      setIsTransitioning(false);
    }, 300);
  }, [featuredMovies.length]);

  const handlePrev = () => {
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev === 0 ? featuredMovies.length - 1 : prev - 1));
      setIsTransitioning(false);
    }, 300);
  };

  useEffect(() => {
    if (featuredMovies.length > 1) {
      const interval = setInterval(() => {
        handleNext();
      }, 8000);
      return () => clearInterval(interval);
    }
  }, [featuredMovies.length, handleNext]);

  if (!currentMovie) return null;

  return (
    <div className="relative h-[70vh] min-h-[500px] w-full overflow-hidden">
      {/* Background Image */}
      <div
        className={`absolute inset-0 transition-opacity duration-500 ${
          isTransitioning ? "opacity-0" : "opacity-100"
        }`}
      >
        <img
          src={currentMovie.backdrop || currentMovie.poster}
          alt={currentMovie.title}
          className="w-full h-full object-cover"
        />
        {/* Gradient Overlays */}
        <div className="absolute inset-0 bg-gradient-to-r from-gray-900 via-gray-900/80 to-transparent"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-gray-900/50"></div>
      </div>

      {/* Content */}
      <div className="relative h-full flex items-center px-8 md:px-16 lg:px-24">
        <div className={`max-w-2xl transition-all duration-500 ${isTransitioning ? "opacity-0 translate-y-4" : "opacity-100 translate-y-0"}`}>
          {/* Mood Badge */}
          {currentMood && (
            <div className="inline-flex items-center gap-2 bg-purple-600/80 backdrop-blur-sm px-4 py-2 rounded-full mb-4">
              <span className="text-xl">
                {currentMood === "happy" && "😊"}
                {currentMood === "sad" && "😢"}
                {currentMood === "excited" && "🤩"}
                {currentMood === "relaxed" && "😌"}
                {currentMood === "romantic" && "💕"}
                {currentMood === "adventurous" && "🚀"}
                {currentMood === "scared" && "😱"}
                {currentMood === "thoughtful" && "🤔"}
              </span>
              <span className="text-white font-medium capitalize">
                Perfect for {currentMood} mood
              </span>
            </div>
          )}

          {/* Title */}
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 leading-tight drop-shadow-lg">
            {currentMovie.title}
          </h1>

          {/* Meta Info */}
          <div className="flex items-center gap-4 mb-4">
            <span className="text-yellow-400 font-semibold flex items-center gap-1 drop-shadow-md">
              ⭐ {currentMovie.rating}
            </span>
            <span className="text-white font-medium drop-shadow-md">{currentMovie.year}</span>
            <span className="px-3 py-1 bg-gray-800/90 backdrop-blur-sm rounded-full text-white text-sm font-medium">
              {currentMovie.genre}
            </span>
          </div>

          {/* Description */}
          <p className="text-cyan-100 text-lg mb-6 line-clamp-5 leading-relaxed drop-shadow-lg bg-gradient-to-r from-gray-900/80 to-gray-800/60 backdrop-blur-md p-4 rounded-xl max-w-xl border border-cyan-500/20">
            {currentMovie.description}
          </p>

          {/* Actions */}
          <div className="flex gap-4">
            <button className="flex items-center gap-2 bg-white text-gray-900 font-semibold px-8 py-3 rounded-lg hover:bg-gray-200 transition-colors">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
              </svg>
              Watch Now
            </button>
            <button className="flex items-center gap-2 bg-gray-700/80 backdrop-blur-sm text-white font-semibold px-6 py-3 rounded-lg hover:bg-gray-600 transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              More Info
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Arrows */}
      {featuredMovies.length > 1 && (
        <>
          <button
            onClick={handlePrev}
            className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-gray-800/80 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-gray-700 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={handleNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-gray-800/80 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-gray-700 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </>
      )}

      {/* Dots Indicator */}
      {featuredMovies.length > 1 && (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2">
          {featuredMovies.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`w-2 h-2 rounded-full transition-all ${
                index === currentIndex
                  ? "w-8 bg-purple-500"
                  : "bg-gray-500 hover:bg-gray-400"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default HeroBanner;
