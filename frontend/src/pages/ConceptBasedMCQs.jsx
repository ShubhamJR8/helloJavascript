import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { fetchQuestionsByTopic } from "../apis/quizApi";
import { topics } from "../utils/constants";
import toast from "react-hot-toast";

const ConceptBasedMCQs = () => {
  const navigate = useNavigate();
  const [allTags, setAllTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [tagRelationships, setTagRelationships] = useState({});
  const [expandedCategory, setExpandedCategory] = useState(null);
  const [popularTags, setPopularTags] = useState([]);

  // Function to find common words in tags
  const findCommonWords = (tags) => {
    const wordFrequency = {};
    tags.forEach(tag => {
      const words = tag.toLowerCase().split(/[-_\s]+/);
      words.forEach(word => {
        if (word.length > 2) { // Ignore very short words
          wordFrequency[word] = (wordFrequency[word] || 0) + 1;
        }
      });
    });
    return wordFrequency;
  };

  // Function to find related tags
  const findRelatedTags = (tags) => {
    const relationships = {};
    const wordFrequency = findCommonWords(tags);

    // Find common words that appear in multiple tags
    const commonWords = Object.entries(wordFrequency)
      .filter(([_, count]) => count > 1)
      .map(([word]) => word);

    // Group tags by common words
    commonWords.forEach(word => {
      const relatedTags = tags.filter(tag => 
        tag.toLowerCase().includes(word)
      );
      if (relatedTags.length > 1) {
        relationships[word] = relatedTags;
      }
    });

    return relationships;
  };

  // Function to categorize tags dynamically
  const categorizeTags = (tags) => {
    const relationships = findRelatedTags(tags);
    const categories = {};

    // First pass: Group tags by their relationships
    Object.entries(relationships).forEach(([word, relatedTags]) => {
      const categoryName = word.charAt(0).toUpperCase() + word.slice(1);
      categories[categoryName] = relatedTags;
    });

    // Second pass: Handle remaining tags
    const categorizedTags = new Set(Object.values(categories).flat());
    const uncategorizedTags = tags.filter(tag => !categorizedTags.has(tag));

    // Group uncategorized tags by their first word
    uncategorizedTags.forEach(tag => {
      const firstWord = tag.split(/[-_\s]+/)[0].toLowerCase();
      if (firstWord.length > 2) {
        const categoryName = firstWord.charAt(0).toUpperCase() + firstWord.slice(1);
        categories[categoryName] = categories[categoryName] || [];
        categories[categoryName].push(tag);
      } else {
        categories["Others"] = categories["Others"] || [];
        categories["Others"].push(tag);
      }
    });

    return categories;
  };

  // Function to get tag counts
  const getTagCounts = (questions) => {
    const tagCounts = {};
    questions.forEach(q => {
      if (q.tags) {
        const tags = Array.isArray(q.tags) ? q.tags : q.tags.split(',').map(t => t.trim());
        tags.forEach(tag => {
          tagCounts[tag] = (tagCounts[tag] || 0) + 1;
        });
      }
    });
    return tagCounts;
  };

  useEffect(() => {
    const fetchTags = async () => {
      try {
        console.log('Fetching all questions...');
        const response = await fetchQuestionsByTopic('all');
        console.log('All questions response:', response);

        if (!response.success) {
          throw new Error(response.message || 'Failed to fetch questions');
        }

        if (!Array.isArray(response.questions)) {
          throw new Error('Invalid questions data received from API');
        }

        // Filter questions where interviewImportant is true
        const importantQuestions = response.questions.filter(q => q.interviewImportant !== false);
        console.log('Important questions count:', importantQuestions.length);

        // Get tag counts
        const tagCounts = getTagCounts(importantQuestions);
        
        // Sort tags by count and get top 10
        const sortedTags = Object.entries(tagCounts)
          .sort(([,a], [,b]) => b - a)
          .slice(0, 10)
          .map(([tag]) => tag);
        
        setPopularTags(sortedTags);

        // Extract unique tags from important questions only
        const uniqueTags = [...new Set(
          importantQuestions.flatMap(q => {
            if (!q.tags) {
              console.log('Question without tags:', q);
              return [];
            }
            // Handle both string tags and array of tags
            if (Array.isArray(q.tags)) {
              return q.tags;
            } else if (typeof q.tags === 'string') {
              return q.tags.split(',').map(tag => tag.trim());
            }
            return [];
          })
        )].filter(Boolean).sort();
        
        console.log('Extracted tags from important questions:', uniqueTags);
        
        if (uniqueTags.length === 0) {
          setError('No tags found in the important questions');
        } else {
          setAllTags(uniqueTags);
          // Generate tag relationships
          const relationships = findRelatedTags(uniqueTags);
          setTagRelationships(relationships);
        }
      } catch (err) {
        console.error("Error fetching tags:", err);
        setError(err.message || "Failed to fetch tags");
      } finally {
        setLoading(false);
      }
    };

    fetchTags();
  }, []);

  // Memoize the categorized tags to avoid unnecessary recalculations
  const categorizedTags = useMemo(() => {
    return categorizeTags(allTags);
  }, [allTags]);

  // Get available categories
  const categories = useMemo(() => {
    return ["All", ...Object.keys(categorizedTags).sort()];
  }, [categorizedTags]);

  // Get filtered tags based on search and category
  const filteredTags = useMemo(() => {
    let tags = selectedCategory === "All" 
      ? allTags 
      : categorizedTags[selectedCategory] || [];

    if (searchTerm) {
      tags = tags.filter(tag =>
        tag.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return tags;
  }, [allTags, selectedCategory, searchTerm, categorizedTags]);

  const handleTopicClick = async (topic) => {
    try {
      console.log('ConceptBasedMCQs - Fetching questions for topic:', topic);
      const response = await fetchQuestionsByTopic('all');
      console.log('ConceptBasedMCQs - Questions response:', response);

      if (!response.success) {
        throw new Error(response.message || 'Failed to fetch questions');
      }

      // Filter questions that match the topic and are interview important
      const questions = response.questions.filter(q => {
        if (q.interviewImportant === false) return false;
        return q.topic === topic;
      });

      // Get 10 random questions
      const randomQuestions = questions
        .sort(() => Math.random() - 0.5)
        .slice(0, 10);

      console.log(`ConceptBasedMCQs - Found ${randomQuestions.length} questions for topic ${topic}`);

      if (randomQuestions.length === 0) {
        toast.error('No questions available for this topic');
        return;
      }

      // Transform questions to match the expected format
      const formattedQuestions = randomQuestions.map(q => ({
        id: q._id,
        question: q.question,
        options: q.options,
        timeLimit: q.timeLimit || 30,
        type: q.type || 'mcq',
        correctAnswer: q.correctAnswer,
        tags: q.tags || []
      }));

      const quizState = {
        questions: formattedQuestions,
        topic,
        isTopicBased: true,
        totalQuestions: formattedQuestions.length,
        difficulty: 'mixed',
        isInterviewImportant: true
      };

      console.log('ConceptBasedMCQs - Navigating to quiz with state:', quizState);
      
      try {
        navigate(`/quiz/${topic}/mixed`, {
          state: quizState,
          replace: true
        });
      } catch (navError) {
        console.error('ConceptBasedMCQs - Navigation error:', navError);
        toast.error('Failed to start quiz. Please try again.');
      }
    } catch (error) {
      console.error('ConceptBasedMCQs - Error in handleTopicClick:', error);
      toast.error(error.message || 'Failed to start quiz');
    }
  };

  const handleTagClick = async (tag) => {
    try {
      console.log('ConceptBasedMCQs - Fetching questions for tag:', tag);
      const response = await fetchQuestionsByTopic('all');
      console.log('ConceptBasedMCQs - Questions response:', response);

      if (!response.success) {
        throw new Error(response.message || 'Failed to fetch questions');
      }

      // Filter questions that have this tag and are interview important
      const questions = response.questions.filter(q => {
        if (q.interviewImportant === false) return false;
        if (Array.isArray(q.tags)) {
          return q.tags.includes(tag);
        } else if (typeof q.tags === 'string') {
          return q.tags.split(',').map(t => t.trim()).includes(tag);
        }
        return false;
      });

      console.log(`ConceptBasedMCQs - Found ${questions.length} questions for tag ${tag}`);

      if (questions.length === 0) {
        toast.error('No questions available for this tag');
        return;
      }

      // Transform questions to match the expected format
      const formattedQuestions = questions.map(q => ({
        id: q._id,
        question: q.question,
        options: q.options,
        timeLimit: q.timeLimit || 30,
        type: q.type || 'mcq',
        correctAnswer: q.correctAnswer,
        tags: q.tags || []
      }));

      const quizState = {
        questions: formattedQuestions,
        tag,
        isTagBased: true,
        totalQuestions: formattedQuestions.length,
        topic: tag,
        difficulty: 'mixed',
        isInterviewImportant: true
      };

      console.log('ConceptBasedMCQs - Navigating to quiz with state:', quizState);
      
      try {
        navigate(`/quiz/${tag}/mixed`, {
          state: quizState,
          replace: true
        });
      } catch (navError) {
        console.error('ConceptBasedMCQs - Navigation error:', navError);
        toast.error('Failed to start quiz. Please try again.');
      }
    } catch (error) {
      console.error('ConceptBasedMCQs - Error in handleTagClick:', error);
      toast.error(error.message || 'Failed to start quiz');
    }
  };

  const handleCategoryQuizStart = async (category, categoryQuestions) => {
    try {
      console.log('Starting quiz for category:', category);
      const response = await fetchQuestionsByTopic('all');
      
      if (!response.success) {
        throw new Error(response.message || 'Failed to fetch questions');
      }

      // Filter questions that have any of the category tags and are interview important
      const questions = response.questions.filter(q => {
        if (q.interviewImportant === false) return false;
        const questionTags = Array.isArray(q.tags) ? q.tags : q.tags.split(',').map(t => t.trim());
        return categoryQuestions.some(cq => questionTags.includes(cq.tag));
      });

      if (questions.length === 0) {
        toast.error('No questions available for this category');
        return;
      }

      // Transform questions to match the expected format
      const formattedQuestions = questions.map(q => ({
        id: q._id,
        question: q.question,
        options: q.options,
        timeLimit: q.timeLimit || 30,
        type: q.type || 'mcq',
        correctAnswer: q.correctAnswer,
        tags: q.tags || []
      }));

      const quizState = {
        questions: formattedQuestions,
        category,
        isCategoryBased: true,
        totalQuestions: formattedQuestions.length,
        topic: category,
        difficulty: 'mixed',
        isInterviewImportant: true
      };

      console.log('ConceptBasedMCQs - Navigating to quiz with state:', quizState);

      // Navigate directly to quiz page with questions
      navigate(`/quiz/${category}/mixed`, {
        state: quizState
      });
    } catch (error) {
      console.error('Error starting category quiz:', error);
      toast.error(error.message || 'Failed to start quiz');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <div className="text-center text-white">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500 mx-auto"></div>
          <p className="mt-4">Loading tags...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <div className="text-center text-white">
          <p className="text-red-400 mb-4">{error}</p>
          <button
            onClick={() => navigate('/')}
            className="px-4 py-2 bg-teal-500 text-white rounded hover:bg-teal-600 transition-colors"
          >
            Return to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6 pt-20">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="space-y-8">
            <div className="bg-gray-800/50 p-6 rounded-lg">
              <h2 className="text-2xl font-bold text-teal-300 mb-6">Interview Preparation</h2>
              
              {/* Topics Section */}
              <div className="mb-8">
                <h3 className="text-xl font-semibold text-teal-200 mb-4">Choose a Topic</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {topics.map((topic) => (
                    <motion.button
                      key={topic}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleTopicClick(topic)}
                      className="p-4 bg-gray-700/50 hover:bg-gray-700 rounded-lg text-teal-200 font-medium transition-colors capitalize"
                    >
                      {topic}
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Popular Tags Section */}
              <div className="mb-8">
                <h3 className="text-xl font-semibold text-teal-200 mb-4">Popular Concepts</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {popularTags.map((tag) => (
                    <motion.button
                      key={tag}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleTagClick(tag)}
                      className="p-4 bg-gray-700/50 hover:bg-gray-700 rounded-lg text-teal-200 font-medium transition-colors"
                    >
                      {tag}
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Search and Category Controls */}
              <div className="mb-6 space-y-4">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search concepts..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full p-3 pl-10 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                  <svg
                    className="absolute left-3 top-3.5 h-5 w-5 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </div>
              </div>

              {/* Categories and Tags Display */}
              <div className="space-y-6">
                {/* Category Pills with Quiz Start Functionality */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {Object.entries(categorizedTags)
                    .slice(0, expandedCategory ? undefined : 8) // Show first 8 items (2 rows) initially
                    .map(([category, tags]) => (
                      <motion.button
                        key={category}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => {
                          // Start quiz with all tags from this category
                          const categoryQuestions = allTags
                            .filter(tag => tags.includes(tag))
                            .map(tag => ({
                              tag,
                              category
                            }));
                          
                          if (categoryQuestions.length > 0) {
                            handleCategoryQuizStart(category, categoryQuestions);
                          } else {
                            toast.error('No questions available for this category');
                          }
                        }}
                        className="group relative p-4 bg-gray-700/30 hover:bg-gray-700/50 rounded-lg transition-colors"
                      >
                        <div className="flex flex-col items-start">
                          <span className="text-teal-200 font-medium text-lg mb-1">{category}</span>
                          <span className="text-gray-400 text-sm">
                            {tags.length} concepts
                          </span>
                        </div>
                        <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                          <svg
                            className="w-5 h-5 text-teal-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 5l7 7-7 7"
                            />
                          </svg>
                        </div>
                      </motion.button>
                    ))}
                </div>

                {/* Show More/Less Button */}
                {Object.keys(categorizedTags).length > 8 && (
                  <div className="text-center">
                    <button
                      onClick={() => setExpandedCategory(!expandedCategory)}
                      className="px-4 py-2 bg-gray-700/50 hover:bg-gray-700 text-teal-200 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 mx-auto"
                    >
                      {expandedCategory ? (
                        <>
                          Show Less
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M5 15l7-7 7 7"
                            />
                          </svg>
                        </>
                      ) : (
                        <>
                          Show More
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 9l-7 7-7-7"
                            />
                          </svg>
                        </>
                      )}
                    </button>
                  </div>
                )}

                {/* Search Results */}
                {searchTerm && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-teal-200">Search Results</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {filteredTags.map((tag) => (
                        <motion.button
                          key={tag}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => handleTagClick(tag)}
                          className="group relative p-4 bg-gray-700/30 hover:bg-gray-700/50 rounded-lg transition-colors"
                        >
                          <div className="flex flex-col items-start">
                            <span className="text-teal-200 font-medium text-sm mb-1">{tag}</span>
                            <span className="text-gray-400 text-xs">
                              {Object.entries(categorizedTags).find(([_, tags]) => tags.includes(tag))?.[0] || "Other"}
                            </span>
                          </div>
                          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <svg
                              className="w-4 h-4 text-teal-400"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 5l7 7-7 7"
                              />
                            </svg>
                          </div>
                        </motion.button>
                      ))}
                    </div>
                  </div>
                )}

                {/* No Results Message */}
                {searchTerm && filteredTags.length === 0 && (
                  <div className="text-center py-8">
                    <p className="text-gray-400">No concepts found matching your search criteria.</p>
                    <button
                      onClick={() => setSearchTerm("")}
                      className="mt-4 text-teal-400 hover:text-teal-300"
                    >
                      Clear search
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="mt-8">
            <button
              onClick={() => navigate('/')}
              className="px-6 py-3 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors"
            >
              Return to Home
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ConceptBasedMCQs;