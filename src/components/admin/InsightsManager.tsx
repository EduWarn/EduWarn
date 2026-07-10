
import React, { ReactNode } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAdminStats } from '@/hooks/useAdminStats';
import { Loader2, Users, BookOpen, MessageSquare, FileText, UserCheck, ShoppingCart } from 'lucide-react';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#A259FF', '#FF6B6B'];

const StatCard = ({ 
  title, value, icon, description 
}: { 
  title: string; value: string | number; icon: ReactNode; description: string;
}) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      <div className="text-primary">{icon}</div>
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
      <p className="text-xs text-muted-foreground mt-1">{description}</p>
    </CardContent>
  </Card>
);

const InsightsManager = () => {
  const { 
    totalStudents, activeCourses, totalBlogs, totalContacts,
    totalRegistrations, totalPurchases, courseEnrollmentData, isLoading 
  } = useAdminStats(true);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  const summaryData = [
    { name: 'Courses', count: activeCourses },
    { name: 'Blog Posts', count: totalBlogs },
    { name: 'Contacts', count: totalContacts },
    { name: 'Registrations', count: totalRegistrations },
    { name: 'Purchases', count: totalPurchases },
  ];

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <StatCard 
          title="Total Students"
          value={totalStudents}
          icon={<UserCheck className="h-4 w-4" />}
          description="Sum of enrolled students across all courses"
        />
        <StatCard 
          title="Active Courses"
          value={activeCourses}
          icon={<BookOpen className="h-4 w-4" />}
          description="Total courses in the system"
        />
        <StatCard 
          title="Registrations"
          value={totalRegistrations}
          icon={<Users className="h-4 w-4" />}
          description="Total trial registrations"
        />
        <StatCard 
          title="Contacts"
          value={totalContacts}
          icon={<MessageSquare className="h-4 w-4" />}
          description="Total contact form submissions"
        />
        <StatCard 
          title="Blog Posts"
          value={totalBlogs}
          icon={<FileText className="h-4 w-4" />}
          description="Total articles published"
        />
        <StatCard 
          title="Purchases"
          value={totalPurchases}
          icon={<ShoppingCart className="h-4 w-4" />}
          description="Completed course purchases"
        />
      </div>

      <Tabs defaultValue="summary" className="space-y-4">
        <TabsList>
          <TabsTrigger value="summary">Content Summary</TabsTrigger>
          <TabsTrigger value="courses">Course Enrollment</TabsTrigger>
        </TabsList>
        
        <TabsContent value="summary" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Content Overview</CardTitle>
              <CardDescription>All content counts from your database</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={summaryData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="hsl(var(--primary))" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="courses" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Course Enrollment Distribution</CardTitle>
              <CardDescription>Students per course from database</CardDescription>
            </CardHeader>
            <CardContent>
              {courseEnrollmentData.length === 0 ? (
                <p className="text-center py-12 text-muted-foreground">No enrollment data available.</p>
              ) : (
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={courseEnrollmentData}
                        cx="50%"
                        cy="50%"
                        labelLine={true}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={100}
                        dataKey="students"
                        nameKey="courseName"
                      >
                        {courseEnrollmentData.map((_: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default InsightsManager;
