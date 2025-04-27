
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Course } from '@/services/courseTypes';
import { getAllCourses } from '@/services/courseDataService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const Education = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  useEffect(() => {
    const fetchCourses = async () => {
      setLoading(true);
      try {
        const allCourses = await getAllCourses();
        setCourses(allCourses);
      } catch (error) {
        console.error("Failed to fetch courses:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  const filteredCourses = courses.filter(course => {
    const searchMatch = course.title.toLowerCase().includes(searchQuery.toLowerCase());
    const categoryMatch = selectedCategory ? course.category === selectedCategory : true;
    return searchMatch && categoryMatch;
  });

  const fallbackImage = "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=800&auto=format&fit=crop";

  return (
    <div className="container mx-auto py-12">
      <div className="mb-8 flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800">Explore Our Courses</h1>
        <Input
          type="text"
          placeholder="Search courses..."
          className="w-64"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="mb-6">
        <Label htmlFor="category" className="block text-sm font-medium text-gray-700">
          Filter by Category
        </Label>
        <Select
          value={selectedCategory || ""}
          onValueChange={(value) => setSelectedCategory(value === "all" ? null : value)}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="model">Model</SelectItem>
            <SelectItem value="designer">Designer</SelectItem>
            <SelectItem value="photographer">Photographer</SelectItem>
            <SelectItem value="videographer">Videographer</SelectItem>
            <SelectItem value="musical_artist">Musical Artist</SelectItem>
            <SelectItem value="fine_artist">Fine Artist</SelectItem>
            <SelectItem value="event_planner">Event Planner</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full text-center py-8">
            Loading courses...
          </div>
        ) : filteredCourses.length > 0 ? (
          filteredCourses.map((course) => (
            <Link
              key={course.id}
              to={`/courses/${course.id}`}
              className="group relative block bg-black rounded-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
            >
              <img
                alt={course.title}
                src={course.image_url || fallbackImage}
                className="absolute inset-0 h-full w-full object-cover opacity-75 transition-opacity group-hover:opacity-50"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.onerror = null;
                  target.src = fallbackImage;
                }}
              />
              <div className="relative h-64">
                <div className="absolute inset-0 flex flex-col items-start justify-end p-6 bg-gradient-to-t from-black/80 to-transparent">
                  <div className="mb-2">
                    <span className="inline-block bg-emerge-gold px-3 py-1 text-sm text-black font-medium rounded">
                      {course.category.charAt(0).toUpperCase() + course.category.slice(1).replace('_', ' ')}
                    </span>
                  </div>
                  <h3 className="text-white text-xl font-bold mb-2">
                    {course.title}
                  </h3>
                  <p className="text-gray-200 text-sm line-clamp-2">
                    {course.summary || 'No description available'}
                  </p>
                </div>
              </div>
            </Link>
          ))
        ) : (
          <div className="col-span-full text-center py-8">
            No courses found.
          </div>
        )}
      </div>
    </div>
  );
};

export default Education;
