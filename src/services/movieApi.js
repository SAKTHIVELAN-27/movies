import axios from "axios";

// TMDB API Configuration
// Note: In production, use environment variables for API keys
const TMDB_API_KEY = "2dca580c2a14b55200e784d157207b4d"; // Free public demo key
const TMDB_BASE_URL = "https://api.themoviedb.org/3";
const TMDB_IMAGE_BASE = "https://image.tmdb.org/t/p/w500";

// Create axios instance for TMDB
const tmdbApi = axios.create({
  baseURL: TMDB_BASE_URL,
  params: {
    api_key: TMDB_API_KEY,
    language: "en-US",
  },
});

// Mood to Genre/Keyword mapping for TMDB
// TMDB Genre IDs: https://developers.themoviedb.org/3/genres/get-movie-list
export const moodToGenres = {
  happy: {
    genres: [35, 10751, 16], // Comedy, Family, Animation
    keywords: "feel good,uplifting,funny",
    sort: "popularity.desc",
  },
  sad: {
    genres: [18, 10749], // Drama, Romance
    keywords: "emotional,tearjerker,heartbreak",
    sort: "vote_average.desc",
  },
  excited: {
    genres: [28, 12, 53], // Action, Adventure, Thriller
    keywords: "action packed,adrenaline,intense",
    sort: "popularity.desc",
  },
  relaxed: {
    genres: [10751, 16, 99], // Family, Animation, Documentary
    keywords: "peaceful,calm,nature",
    sort: "vote_average.desc",
  },
  romantic: {
    genres: [10749, 35], // Romance, Comedy
    keywords: "love story,romantic,dating",
    sort: "popularity.desc",
  },
  adventurous: {
    genres: [12, 878, 14], // Adventure, Sci-Fi, Fantasy
    keywords: "epic,journey,exploration",
    sort: "popularity.desc",
  },
  scared: {
    genres: [27, 53, 9648], // Horror, Thriller, Mystery
    keywords: "scary,horror,suspense",
    sort: "popularity.desc",
  },
  thoughtful: {
    genres: [878, 9648, 99], // Sci-Fi, Mystery, Documentary
    keywords: "mind bending,philosophical,thought provoking",
    sort: "vote_average.desc",
  },
};

// TMDB Genre ID to Name mapping
const genreIdToName = {
  28: "Action",
  12: "Adventure",
  16: "Animation",
  35: "Comedy",
  80: "Crime",
  99: "Documentary",
  18: "Drama",
  10751: "Family",
  14: "Fantasy",
  36: "History",
  27: "Horror",
  10402: "Music",
  9648: "Mystery",
  10749: "Romance",
  878: "Sci-Fi",
  10770: "TV Movie",
  53: "Thriller",
  10752: "War",
  37: "Western",
};

// Transform TMDB movie to our app format
const transformMovie = (tmdbMovie, moodId = null) => {
  return {
    id: tmdbMovie.id,
    title: tmdbMovie.title,
    genre: tmdbMovie.genre_ids?.length > 0 
      ? genreIdToName[tmdbMovie.genre_ids[0]] || "Unknown"
      : "Unknown",
    year: tmdbMovie.release_date 
      ? new Date(tmdbMovie.release_date).getFullYear() 
      : "N/A",
    rating: Math.round(tmdbMovie.vote_average * 10) / 10,
    description: tmdbMovie.overview || "No description available.",
    poster: tmdbMovie.poster_path 
      ? `${TMDB_IMAGE_BASE}${tmdbMovie.poster_path}`
      : "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=300&h=450&fit=crop",
    backdrop: tmdbMovie.backdrop_path
      ? `${TMDB_IMAGE_BASE}${tmdbMovie.backdrop_path}`
      : null,
    moods: moodId ? [moodId] : getMoodsForGenres(tmdbMovie.genre_ids || []),
    tmdbId: tmdbMovie.id,
    popularity: tmdbMovie.popularity,
  };
};

// Determine moods based on genres
const getMoodsForGenres = (genreIds) => {
  const moods = [];
  
  if (genreIds.includes(35) || genreIds.includes(10751) || genreIds.includes(16)) {
    moods.push("happy");
  }
  if (genreIds.includes(18)) {
    moods.push("sad");
  }
  if (genreIds.includes(28) || genreIds.includes(53)) {
    moods.push("excited");
  }
  if (genreIds.includes(10751) || genreIds.includes(99)) {
    moods.push("relaxed");
  }
  if (genreIds.includes(10749)) {
    moods.push("romantic");
  }
  if (genreIds.includes(12) || genreIds.includes(878) || genreIds.includes(14)) {
    moods.push("adventurous");
  }
  if (genreIds.includes(27) || genreIds.includes(9648)) {
    moods.push("scared");
  }
  if (genreIds.includes(878) || genreIds.includes(99) || genreIds.includes(9648)) {
    moods.push("thoughtful");
  }
  
  return moods.length > 0 ? moods : ["happy"];
};

// API Functions

/**
 * Fetch movies by mood
 * @param {string} moodId - The mood to filter by
 * @param {number} page - Page number for pagination
 * @returns {Promise<Array>} Array of movies
 */
export const fetchMoviesByMood = async (moodId, page = 1) => {
  try {
    const moodConfig = moodToGenres[moodId];
    if (!moodConfig) {
      console.error("Invalid mood:", moodId);
      return [];
    }

    const response = await tmdbApi.get("/discover/movie", {
      params: {
        with_genres: moodConfig.genres.join(","),
        sort_by: moodConfig.sort,
        page,
        "vote_count.gte": 100, // Ensure movies have some votes
        include_adult: false,
      },
    });

    return response.data.results.map((movie) => transformMovie(movie, moodId));
  } catch (error) {
    console.error("Error fetching movies by mood:", error);
    return [];
  }
};

/**
 * Fetch popular movies
 * @param {number} page - Page number
 * @returns {Promise<Array>} Array of movies
 */
export const fetchPopularMovies = async (page = 1) => {
  try {
    const response = await tmdbApi.get("/movie/popular", {
      params: { page },
    });
    return response.data.results.map((movie) => transformMovie(movie));
  } catch (error) {
    console.error("Error fetching popular movies:", error);
    return [];
  }
};

/**
 * Fetch trending movies
 * @param {string} timeWindow - "day" or "week"
 * @returns {Promise<Array>} Array of movies
 */
export const fetchTrendingMovies = async (timeWindow = "week") => {
  try {
    const response = await tmdbApi.get(`/trending/movie/${timeWindow}`);
    return response.data.results.map((movie) => transformMovie(movie));
  } catch (error) {
    console.error("Error fetching trending movies:", error);
    return [];
  }
};

/**
 * Fetch top rated movies
 * @param {number} page - Page number
 * @returns {Promise<Array>} Array of movies
 */
export const fetchTopRatedMovies = async (page = 1) => {
  try {
    const response = await tmdbApi.get("/movie/top_rated", {
      params: { page },
    });
    return response.data.results.map((movie) => transformMovie(movie));
  } catch (error) {
    console.error("Error fetching top rated movies:", error);
    return [];
  }
};

/**
 * Search movies by query
 * @param {string} query - Search query
 * @param {number} page - Page number
 * @returns {Promise<Array>} Array of movies
 */
export const searchMovies = async (query, page = 1) => {
  try {
    const response = await tmdbApi.get("/search/movie", {
      params: { query, page },
    });
    return response.data.results.map((movie) => transformMovie(movie));
  } catch (error) {
    console.error("Error searching movies:", error);
    return [];
  }
};

/**
 * Get movie details by ID
 * @param {number} movieId - TMDB movie ID
 * @returns {Promise<Object|null>} Movie details
 */
export const getMovieDetails = async (movieId) => {
  try {
    const response = await tmdbApi.get(`/movie/${movieId}`, {
      params: {
        append_to_response: "videos,credits,similar",
      },
    });
    
    const movie = response.data;
    return {
      ...transformMovie({
        ...movie,
        genre_ids: movie.genres?.map((g) => g.id) || [],
      }),
      runtime: movie.runtime,
      tagline: movie.tagline,
      budget: movie.budget,
      revenue: movie.revenue,
      videos: movie.videos?.results || [],
      cast: movie.credits?.cast?.slice(0, 10) || [],
      similar: movie.similar?.results?.map((m) => transformMovie(m)) || [],
    };
  } catch (error) {
    console.error("Error fetching movie details:", error);
    return null;
  }
};

/**
 * Fetch movies for all moods (for home page)
 * @returns {Promise<Object>} Object with mood IDs as keys and movie arrays as values
 */
export const fetchAllMoodMovies = async () => {
  try {
    const moodIds = Object.keys(moodToGenres);
    const promises = moodIds.map((moodId) => fetchMoviesByMood(moodId));
    const results = await Promise.all(promises);
    
    const moviesByMood = {};
    moodIds.forEach((moodId, index) => {
      moviesByMood[moodId] = results[index];
    });
    
    return moviesByMood;
  } catch (error) {
    console.error("Error fetching all mood movies:", error);
    return {};
  }
};

/**
 * Get movie recommendations based on a movie
 * @param {number} movieId - TMDB movie ID
 * @returns {Promise<Array>} Array of recommended movies
 */
export const getRecommendations = async (movieId) => {
  try {
    const response = await tmdbApi.get(`/movie/${movieId}/recommendations`);
    return response.data.results.map((movie) => transformMovie(movie));
  } catch (error) {
    console.error("Error fetching recommendations:", error);
    return [];
  }
};

export default {
  fetchMoviesByMood,
  fetchPopularMovies,
  fetchTrendingMovies,
  fetchTopRatedMovies,
  searchMovies,
  getMovieDetails,
  fetchAllMoodMovies,
  getRecommendations,
};
