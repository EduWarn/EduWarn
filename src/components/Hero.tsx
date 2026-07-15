
import React, { useState, useRef, useEffect } from 'react';
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useForm, SubmitHandler } from "react-hook-form";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface IEnrollmentForm {
  fullName: string;
  email: string;
  phone: string;
  grade: string;
}

interface EducationOffering {
  title: string;
  subtitle: string;
  description: string;
  buttonText: string;
  nepaliText: string;
  gradeOptions: Array<{ value: string; label: string; }>;
}

const educationOfferings: EducationOffering[] = [
  {
    title: "Free SEE Learning",
    subtitle: "Open for all",
    description: "Explore practical SEE lessons, notes, and study resources without paying a fee.",
    buttonText: "Explore Free Lessons",
    nepaliText: "SEE को निःशुल्क सिकाइ सुरु गर्नुहोस्",
    gradeOptions: [
      { value: "grade-9", label: "Grade 9" },
      { value: "grade-10", label: "Grade 10 (SEE)" }
    ]
  },
  {
    title: "Practical +2 Study Paths",
    subtitle: "Free access",
    description: "Build your foundation in Science, Management, and Humanities with clear lessons and downloadable resources.",
    buttonText: "Explore +2 Courses",
    nepaliText: "+2 को निःशुल्क सिकाइ सुरु गर्नुहोस्",
    gradeOptions: [
      { value: "grade-11", label: "Grade 11" },
      { value: "grade-12", label: "Grade 12" }
    ]
  },
  {
    title: "Fun Learning for Grade 8",
    subtitle: "Build strong basics",
    description: "Make learning feel lighter and more engaging with step-by-step lessons and practical examples.",
    buttonText: "Open Grade 8 Lessons",
    nepaliText: "कक्षा ८ को निःशुल्क सिकाइ सुरु गर्नुहोस्",
    gradeOptions: [
      { value: "grade-6", label: "Grade 6" },
      { value: "grade-7", label: "Grade 7" },
      { value: "grade-8", label: "Grade 8" }
    ]
  },
  {
    title: "Free IELTS Practice",
    subtitle: "Skill-first",
    description: "Strengthen your English with practical lessons designed to build confidence for real exam situations.",
    buttonText: "Explore IELTS Lessons",
    nepaliText: "IELTS को निःशुल्क अभ्यास सुरु गर्नुहोस्",
    gradeOptions: [
      { value: "ielts-basic", label: "IELTS Basic" },
      { value: "ielts-advanced", label: "IELTS Advanced" }
    ]
  },
  {
    title: "Free LokSewa Preparation",
    subtitle: "Practical guidance",
    description: "Learn with structured notes, current affairs support, and study resources that make preparation easier.",
    buttonText: "Open LokSewa Resources",
    nepaliText: "लोकसेवा को निःशुल्क तयारी सुरु गर्नुहोस्",
    gradeOptions: [
      { value: "loksewa-officer", label: "Officer Level" },
      { value: "loksewa-assistant", label: "Assistant Level" },
      { value: "loksewa-kharidar", label: "Kharidar Level" }
    ]
  }
];

const Hero = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentOfferingIndex, setCurrentOfferingIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const { register, handleSubmit, reset, formState: { errors } } = useForm<IEnrollmentForm>();
  const formRef = useRef<HTMLDivElement>(null);

  const currentOffering = educationOfferings[currentOfferingIndex];

  // Rotate through offerings every 8 seconds (only when not paused)
  useEffect(() => {
    if (isPaused) return;
    
    const interval = setInterval(() => {
      setCurrentOfferingIndex((prev) => (prev + 1) % educationOfferings.length);
    }, 8000);

    return () => clearInterval(interval);
  }, [isPaused]);

  const nextOffering = () => {
    setIsPaused(true);
    setCurrentOfferingIndex((prev) => (prev + 1) % educationOfferings.length);
    // Resume auto-rotation after 10 seconds
    setTimeout(() => setIsPaused(false), 10000);
  };

  const prevOffering = () => {
    setIsPaused(true);
    setCurrentOfferingIndex((prev) => (prev - 1 + educationOfferings.length) % educationOfferings.length);
    // Resume auto-rotation after 10 seconds
    setTimeout(() => setIsPaused(false), 10000);
  };

  const goToOffering = (index: number) => {
    setIsPaused(true);
    setCurrentOfferingIndex(index);
    // Resume auto-rotation after 10 seconds
    setTimeout(() => setIsPaused(false), 10000);
  };

  const browseCourses = () => {
    window.location.assign('/courses');
  };
  

  const onSubmit: SubmitHandler<IEnrollmentForm> = async (data) => {
    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('registrations')
        .insert([
          {
            full_name: data.fullName,
            email: data.email,
            phone: data.phone,
            grade: data.grade
          }
        ]);

      if (error) {
        console.error("Registration error:", error);
        throw error;
      }
      
      toast.success("Registration successful! We'll contact you soon.");
      reset();
      
    } catch (error) {
      console.error("Error submitting form:", error);
      toast.error("Registration failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-gradient-to-r from-primary to-primary/80 text-white py-16 md:py-24">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center">
          <div className="md:w-1/2 mb-10 md:mb-0 relative">
            {/* Navigation arrows */}
            <button
              onClick={prevOffering}
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 bg-white/20 hover:bg-white/30 rounded-full p-2 transition-all duration-300"
              aria-label="Previous offering"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
            
            <button
              onClick={nextOffering}
              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 bg-white/20 hover:bg-white/30 rounded-full p-2 transition-all duration-300"
              aria-label="Next offering"
            >
              <ChevronRight className="h-6 w-6" />
            </button>

            <h1 className="text-3xl md:text-5xl font-bold mb-4 leading-tight transition-all duration-500">
              {currentOffering.title} <span className="text-amber-400">{currentOffering.subtitle}</span>
            </h1>
            <p className="text-lg md:text-xl mb-8 text-gray-100 transition-all duration-500">
              {currentOffering.description}
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <button 
                className="bg-amber-500 hover:bg-amber-600 text-foreground font-bold py-3 px-6 rounded-md transition-all duration-300"
                onClick={browseCourses}
              >
                <span className="uppercase">{currentOffering.buttonText}</span>
              </button>
              <button 
                className="bg-background hover:bg-muted text-primary font-medium py-3 px-6 rounded-md transition-all duration-300"
                onClick={browseCourses}
              >
                <span className="nepali-text">{currentOffering.nepaliText}</span>
              </button>
            </div>
            
            <div className="mt-8 bg-white/10 p-4 rounded-lg backdrop-blur-sm border border-white/20">
              <p className="text-amber-400 font-bold">🌟 Free learning, made practical</p>
              <p className="text-sm mt-1">No fees, no barriers, just clear lessons and useful resources.</p>
            </div>

            {/* Progress indicators for offerings */}
            <div className="flex gap-2 mt-6 justify-center">
              {educationOfferings.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToOffering(index)}
                  className={`h-2 w-8 rounded-full transition-all duration-300 ${
                    index === currentOfferingIndex ? 'bg-amber-400' : 'bg-white/30 hover:bg-white/50'
                  }`}
                  aria-label={`Go to offering ${index + 1}`}
                />
              ))}
            </div>
          </div>
          
          <div className="md:w-1/2 md:pl-12" ref={formRef}>
            <div className="bg-white p-6 rounded-xl shadow-xl">
              <h3 className="text-primary text-xl font-bold mb-4">Start learning for free</h3>
              <form onSubmit={handleSubmit(onSubmit)}>
                <div className="space-y-4">
                  <div>
                    <Input
                      type="text"
                      placeholder="Full Name"
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary text-black"
                      {...register("fullName", { required: "Full name is required" })}
                    />
                    {errors.fullName && <p className="text-red-500 text-xs mt-1">{errors.fullName.message}</p>}
                  </div>

                  <div>
                    <Input
                      type="email"
                      placeholder="Email Address"
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary text-black"
                      {...register("email", { 
                        required: "Email is required",
                        pattern: {
                          value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                          message: "Invalid email address"
                        }
                      })}
                    />
                    {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
                  </div>

                  <div>
                    <Input
                      type="tel"
                      placeholder="Phone Number"
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary text-black"
                      {...register("phone", { required: "Phone number is required" })}
                    />
                    {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone.message}</p>}
                  </div>

                  <div>
                    <select
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary text-black"
                      {...register("grade", { required: "Please select a grade/level" })}
                    >
                      <option value="">Select Grade/Level</option>
                      <option value="grade-1">Grade 1</option>
                      <option value="grade-2">Grade 2</option>
                      <option value="grade-3">Grade 3</option>
                      <option value="grade-4">Grade 4</option>
                      <option value="grade-5">Grade 5</option>
                      <option value="grade-6">Grade 6</option>
                      <option value="grade-7">Grade 7</option>
                      <option value="grade-8">Grade 8</option>
                      <option value="grade-9">Grade 9</option>
                      <option value="grade-10">Grade 10 (SEE)</option>
                      <option value="grade-11">Grade 11</option>
                      <option value="grade-12">Grade 12</option>
                      <option value="bachelors">Bachelors</option>
                      <option value="masters">Masters</option>
                      <option value="ielts">IELTS Preparation</option>
                      <option value="loksewa">LokSewa Preparation</option>
                      <option value="other">Other</option>
                    </select>
                    {errors.grade && <p className="text-red-500 text-xs mt-1">{errors.grade.message}</p>}
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-secondary text-white hover:bg-secondary/90 py-3"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Opening courses..." : "Explore free lessons"}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
