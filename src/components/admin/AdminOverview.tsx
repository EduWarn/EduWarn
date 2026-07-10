
import React from 'react';
import { useAdminStats } from '@/hooks/useAdminStats';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2, BookOpen, FileText, MessageSquare, Users, UserCheck, Star, ShoppingCart } from 'lucide-react';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#A259FF', '#FF6B6B'];

const AdminOverview = () => {
  const { user } = useAuth();
  const {
    activeCourses, totalBlogs, totalContacts, totalRegistrations,
    totalStudents, totalPurchases, totalTeamMembers, totalTestimonials,
    courseEnrollmentData, isLoading
  } = useAdminStats(true);
  
  const overviewData = [
    { name: 'Courses', count: activeCourses },
    { name: 'Blog Posts', count: totalBlogs },
    { name: 'Contacts', count: totalContacts },
    { name: 'Registrations', count: totalRegistrations },
    { name: 'Purchases', count: totalPurchases },
  ];

  const stats = [
    { label: 'Courses', value: activeCourses, icon: <BookOpen className="h-5 w-5" />, color: 'text-blue-600' },
    { label: 'Blog Posts', value: totalBlogs, icon: <FileText className="h-5 w-5" />, color: 'text-green-600' },
    { label: 'Contacts', value: totalContacts, icon: <MessageSquare className="h-5 w-5" />, color: 'text-purple-600' },
    { label: 'Registrations', value: totalRegistrations, icon: <Users className="h-5 w-5" />, color: 'text-orange-600' },
    { label: 'Students', value: totalStudents, icon: <UserCheck className="h-5 w-5" />, color: 'text-cyan-600' },
    { label: 'Purchases', value: totalPurchases, icon: <ShoppingCart className="h-5 w-5" />, color: 'text-pink-600' },
    { label: 'Team Members', value: totalTeamMembers, icon: <Users className="h-5 w-5" />, color: 'text-indigo-600' },
    { label: 'Testimonials', value: totalTestimonials, icon: <Star className="h-5 w-5" />, color: 'text-yellow-600' },
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="py-4">
          <CardTitle className="text-xl flex items-center gap-2">
            <span>Welcome</span>
            <span className="text-primary">{user?.user_metadata?.full_name || user?.email}</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Manage your website content and monitor performance from this dashboard.</p>
        </CardContent>
      </Card>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className={stat.color}>{stat.icon}</span>
              </div>
              <div className="text-2xl font-bold">
                {isLoading ? <Loader2 className="animate-spin h-6 w-6" /> : stat.value}
              </div>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>
      
      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Content Overview</TabsTrigger>
          <TabsTrigger value="enrollment">Course Enrollment</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Content Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={overviewData}>
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
        <TabsContent value="enrollment" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Student Distribution by Course</CardTitle>
            </CardHeader>
            <CardContent>
              {courseEnrollmentData.length === 0 ? (
                <p className="text-center py-12 text-muted-foreground">No enrollment data available yet.</p>
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

export default AdminOverview;
