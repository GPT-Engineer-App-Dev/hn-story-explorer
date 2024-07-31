import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { ExternalLink, ThumbsUp, MessageSquare, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';

const fetchTopStories = async () => {
  const response = await fetch('https://hn.algolia.com/api/v1/search?tags=front_page&hitsPerPage=100');
  if (!response.ok) {
    throw new Error('Network response was not ok');
  }
  return response.json();
};

const Index = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('points');
  const { data, isLoading, error } = useQuery({
    queryKey: ['topStories'],
    queryFn: fetchTopStories,
  });

  const filteredAndSortedStories = data?.hits
    .filter(story => story.title.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a, b) => b[sortBy] - a[sortBy]) || [];

  useEffect(() => {
    document.body.classList.add('bg-gradient-to-r', 'from-purple-400', 'via-pink-500', 'to-red-500');
    return () => {
      document.body.classList.remove('bg-gradient-to-r', 'from-purple-400', 'via-pink-500', 'to-red-500');
    };
  }, []);

  return (
    <div className="container mx-auto p-4">
      <motion.h1 
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-4xl font-bold mb-6 text-center text-white"
      >
        Top 100 Hacker News Stories
      </motion.h1>
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <Input
          type="text"
          placeholder="Search stories..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-grow"
        />
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="p-2 rounded-md border border-gray-300"
        >
          <option value="points">Sort by Points</option>
          <option value="num_comments">Sort by Comments</option>
          <option value="created_at_i">Sort by Date</option>
        </select>
      </div>
      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(9)].map((_, index) => (
            <Card key={index} className="animate-pulse">
              <CardHeader>
                <div className="h-6 bg-gray-200 rounded w-3/4"></div>
              </CardHeader>
              <CardContent>
                <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      {error && <p className="text-red-500">Error: {error.message}</p>}
      {!isLoading && !error && (
        <AnimatePresence>
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            {filteredAndSortedStories.map((story, index) => (
              <motion.div
                key={story.objectID}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <Card className="h-full flex flex-col hover:shadow-lg transition-shadow duration-300">
                  <CardHeader>
                    <CardTitle className="text-lg line-clamp-2">{story.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="flex-grow">
                    <p className="text-sm text-gray-500 mb-2">
                      By {story.author} | {format(new Date(story.created_at), 'MMM d, yyyy')}
                    </p>
                  </CardContent>
                  <CardFooter className="flex justify-between items-center">
                    <div className="flex items-center space-x-4">
                      <span className="flex items-center"><ThumbsUp className="h-4 w-4 mr-1" /> {story.points}</span>
                      <span className="flex items-center"><MessageSquare className="h-4 w-4 mr-1" /> {story.num_comments}</span>
                      <span className="flex items-center"><Clock className="h-4 w-4 mr-1" /> {format(new Date(story.created_at), 'HH:mm')}</span>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      asChild
                    >
                      <a href={story.url} target="_blank" rel="noopener noreferrer">
                        Read More <ExternalLink className="ml-2 h-4 w-4" />
                      </a>
                    </Button>
                  </CardFooter>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
};

export default Index;
