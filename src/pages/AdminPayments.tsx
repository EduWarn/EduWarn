import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import {
  usePaymentVerifications,
  useApprovePayment,
  useRejectPayment,
  getScreenshotSignedUrl,
  PaymentVerification,
} from '@/hooks/usePaymentVerifications';
import { supabase } from '@/integrations/supabase/client';
import { CheckCircle2, XCircle, Eye, Loader2 } from 'lucide-react';
import { format } from 'date-fns';

const AdminPayments = () => {
  const [tab, setTab] = useState<'pending' | 'approved' | 'rejected'>('pending');
  const { data, isLoading } = usePaymentVerifications(tab);
  const approve = useApprovePayment();
  const reject = useRejectPayment();
  const [viewing, setViewing] = useState<PaymentVerification | null>(null);
  const [viewingUrl, setViewingUrl] = useState<string | null>(null);
  const [rejectTarget, setRejectTarget] = useState<PaymentVerification | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [courseTitles, setCourseTitles] = useState<Record<string, string>>({});

  React.useEffect(() => {
    if (!data) return;
    const missing = data.map((v) => v.course_id).filter((id) => !courseTitles[id]);
    if (!missing.length) return;
    supabase.from('courses').select('id,title').in('id', missing).then(({ data: rows }) => {
      if (!rows) return;
      const map: Record<string, string> = { ...courseTitles };
      rows.forEach((r: any) => (map[r.id] = r.title));
      setCourseTitles(map);
    });
  }, [data]);

  const openScreenshot = async (v: PaymentVerification) => {
    setViewing(v);
    setViewingUrl(null);
    const url = await getScreenshotSignedUrl(v.screenshot_url);
    setViewingUrl(url);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-primary">Payment Verifications</h1>
        <p className="text-muted-foreground">Review and approve student payment submissions.</p>
      </div>

      <Tabs value={tab} onValueChange={(v) => setTab(v as any)}>
        <TabsList>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="approved">Approved</TabsTrigger>
          <TabsTrigger value="rejected">Rejected</TabsTrigger>
        </TabsList>

        <TabsContent value={tab} className="mt-4 space-y-4">
          {isLoading && [1, 2, 3].map((i) => <Skeleton key={i} className="h-32 w-full" />)}
          {!isLoading && data?.length === 0 && (
            <Card><CardContent className="py-10 text-center text-muted-foreground">No {tab} payments.</CardContent></Card>
          )}
          {data?.map((v) => (
            <Card key={v.id}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between gap-4 flex-wrap">
                  <div>
                    <CardTitle className="text-base">{courseTitles[v.course_id] || 'Course'}</CardTitle>
                    <p className="text-xs text-muted-foreground mt-1">
                      Submitted {format(new Date(v.created_at), 'PPp')}
                    </p>
                  </div>
                  <Badge variant={v.status === 'pending' ? 'secondary' : v.status === 'approved' ? 'default' : 'destructive'}>
                    {v.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid sm:grid-cols-3 gap-3 text-sm mb-4">
                  <div><span className="text-muted-foreground">Method:</span> <span className="font-medium capitalize">{v.payment_method}</span></div>
                  <div><span className="text-muted-foreground">Txn ID:</span> <span className="font-mono">{v.transaction_id}</span></div>
                  <div><span className="text-muted-foreground">User ID:</span> <span className="font-mono text-xs">{v.user_id.slice(0, 8)}…</span></div>
                </div>
                {v.status === 'rejected' && v.rejection_reason && (
                  <p className="text-sm text-destructive mb-3">Reason: {v.rejection_reason}</p>
                )}
                <div className="flex gap-2 flex-wrap">
                  <Button size="sm" variant="outline" onClick={() => openScreenshot(v)}>
                    <Eye className="w-4 h-4 mr-1" /> View Screenshot
                  </Button>
                  {v.status === 'pending' && (
                    <>
                      <Button
                        size="sm"
                        onClick={() => approve.mutate(v.id)}
                        disabled={approve.isPending}
                      >
                        {approve.isPending ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <CheckCircle2 className="w-4 h-4 mr-1" />}
                        Approve & Grant Access
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => { setRejectTarget(v); setRejectReason(''); }}
                      >
                        <XCircle className="w-4 h-4 mr-1" /> Reject
                      </Button>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>

      {/* Screenshot dialog */}
      <Dialog open={!!viewing} onOpenChange={() => { setViewing(null); setViewingUrl(null); }}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>Payment Screenshot</DialogTitle></DialogHeader>
          {!viewingUrl ? (
            <div className="flex justify-center py-10"><Loader2 className="w-6 h-6 animate-spin" /></div>
          ) : (
            <img src={viewingUrl} alt="Payment proof" className="w-full rounded-lg" />
          )}
        </DialogContent>
      </Dialog>

      {/* Reject dialog */}
      <Dialog open={!!rejectTarget} onOpenChange={() => setRejectTarget(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Reject payment</DialogTitle></DialogHeader>
          <Textarea
            placeholder="Reason (visible to student, optional)"
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            rows={4}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectTarget(null)}>Cancel</Button>
            <Button
              variant="destructive"
              disabled={reject.isPending}
              onClick={() => {
                if (!rejectTarget) return;
                reject.mutate(
                  { id: rejectTarget.id, reason: rejectReason },
                  { onSuccess: () => setRejectTarget(null) }
                );
              }}
            >
              Confirm reject
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminPayments;
