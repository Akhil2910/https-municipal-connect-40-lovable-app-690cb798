import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { CrudSection, type FieldDef } from "@/components/admin/CrudSection";
import { GrievancesSection } from "@/components/admin/GrievancesSection";
import { UlbsSection } from "@/components/admin/UlbsSection";
import { DomainsSection } from "@/components/admin/DomainsSection";
import { AdminUsersSection } from "@/components/admin/AdminUsersSection";

export const Route = createFileRoute("/admin/")({
  component: AdminDashboard,
});

function AdminDashboard() {
  const nav = useNavigate();
  const [ready, setReady] = useState(false);
  const [ulbs, setUlbs] = useState<{ id: string; name: string; slug: string }[]>([]);
  const [ulbId, setUlbId] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [isSuper, setIsSuper] = useState(false);

  useEffect(() => {
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        nav({ to: "/admin/login" });
        return;
      }
      setEmail(session.user.email ?? "");
      const { data: roles } = await supabase
        .from("user_roles").select("role").eq("user_id", session.user.id);
      const superAdmin = !!roles?.some((r) => r.role === "super_admin");
      setIsSuper(superAdmin);

      let scopedIds: string[] | null = null;
      if (!superAdmin) {
        const { data: scope } = await supabase
          .from("ulb_admins").select("ulb_id").eq("user_id", session.user.id);
        scopedIds = (scope ?? []).map((s) => s.ulb_id);
        if (scopedIds.length === 0) {
          toast.error("You don't have admin access to any municipality");
          await supabase.auth.signOut();
          nav({ to: "/admin/login" });
          return;
        }
      }

      let query = supabase.from("ulbs").select("id,name,slug").order("name");
      if (scopedIds) query = query.in("id", scopedIds);
      const { data: ulbList } = await query;
      if (!ulbList || ulbList.length === 0) {
        toast.error("No municipalities available for this account");
        await supabase.auth.signOut();
        nav({ to: "/admin/login" });
        return;
      }
      setUlbs(ulbList);
      setUlbId(ulbList[0].id);
      setReady(true);
    })();
  }, [nav]);

  async function logout() {
    await supabase.auth.signOut();
    nav({ to: "/admin/login" });
  }

  if (!ready) {
    return <div className="min-h-screen grid place-items-center bg-gov-cream">Loading…</div>;
  }

  const newsFields: FieldDef[] = [
    { name: "title", label: "Title", type: "text", required: true },
    { name: "slug", label: "Slug (unique within ULB)", type: "text" },
    { name: "summary", label: "Summary", type: "textarea" },
    { name: "body", label: "Body", type: "textarea" },
    { name: "image_url", label: "Image", type: "image" },
    { name: "is_published", label: "Published", type: "boolean", default: true },
  ];
  const noticesFields: FieldDef[] = [
    { name: "title", label: "Title", type: "text", required: true },
    { name: "slug", label: "Slug (unique within ULB)", type: "text" },
    { name: "category", label: "Category", type: "text" },
    { name: "notice_date", label: "Date", type: "date" },
    { name: "file_url", label: "File URL", type: "text" },
  ];
  const bannersFields: FieldDef[] = [
    { name: "title", label: "Title (hero heading)", type: "text" },
    { name: "slug", label: "Slug (unique within ULB)", type: "text" },
    { name: "subtitle", label: "Subtitle", type: "text" },
    { name: "image_url", label: "Hero image", type: "image", required: true },
    { name: "link_url", label: "Link URL", type: "text" },
    { name: "sort_order", label: "Sort", type: "number", default: 0 },
    { name: "is_active", label: "Active", type: "boolean", default: true },
  ];
  const tendersFields: FieldDef[] = [
    { name: "title", label: "Title", type: "text", required: true },
    { name: "slug", label: "Slug (unique within ULB)", type: "text" },
    { name: "reference_no", label: "Reference No", type: "text" },
    { name: "category", label: "Category", type: "text" },
    { name: "description", label: "Description", type: "textarea" },
    { name: "file_url", label: "File URL", type: "text" },
    { name: "published_date", label: "Published", type: "date" },
    { name: "last_date", label: "Last Date", type: "date" },
    { name: "status", label: "Status", type: "text", default: "open" },
  ];
  const leadershipFields: FieldDef[] = [
    { name: "name", label: "Name", type: "text", required: true },
    { name: "slug", label: "Slug (unique within ULB)", type: "text" },
    { name: "role", label: "Role", type: "text", required: true },
    { name: "photo_url", label: "Photo", type: "image" },
    { name: "message", label: "Message", type: "textarea" },
    { name: "sort_order", label: "Sort", type: "number", default: 0 },
  ];
  const deptFields: FieldDef[] = [
    { name: "name", label: "Name", type: "text", required: true },
    { name: "slug", label: "Slug (unique within ULB)", type: "text" },
    { name: "head_name", label: "Head", type: "text" },
    { name: "description", label: "Description", type: "textarea" },
    { name: "phone", label: "Phone", type: "text" },
    { name: "email", label: "Email", type: "text" },
  ];
  const galleryFields: FieldDef[] = [
    { name: "image_url", label: "Image", type: "image", required: true },
    { name: "slug", label: "Slug (unique within ULB)", type: "text" },
    { name: "caption", label: "Caption", type: "text" },
    { name: "category", label: "Category", type: "text" },
  ];
  const servicesFields: FieldDef[] = [
    { name: "slug", label: "Slug", type: "text", required: true },
    { name: "title", label: "Title", type: "text", required: true },
    { name: "icon", label: "Icon", type: "text" },
    { name: "short_description", label: "Short Description", type: "text" },
    { name: "content", label: "Content", type: "textarea" },
    { name: "external_url", label: "External URL", type: "text" },
    { name: "sort_order", label: "Sort", type: "number", default: 0 },
  ];
  const councilFields: FieldDef[] = [
    { name: "name", label: "Name", type: "text", required: true },
    { name: "ward", label: "Ward", type: "text" },
    { name: "designation", label: "Designation", type: "text" },
    { name: "phone", label: "Phone", type: "text" },
    { name: "email", label: "Email", type: "text" },
    { name: "photo_url", label: "Photo", type: "image" },
    { name: "sort_order", label: "Sort", type: "number", default: 0 },
  ];
  const coOptionFields: FieldDef[] = councilFields;
  const publicRepsFields: FieldDef[] = [
    { name: "name", label: "Name", type: "text", required: true },
    { name: "designation", label: "Designation (MP / MLA / MLC)", type: "text" },
    { name: "constituency", label: "Constituency", type: "text" },
    { name: "phone", label: "Phone", type: "text" },
    { name: "email", label: "Email", type: "text" },
    { name: "photo_url", label: "Photo", type: "image" },
    { name: "sort_order", label: "Sort", type: "number", default: 0 },
  ];
  const pagesFields: FieldDef[] = [
    { name: "slug", label: "Slug (about, organizational-chart, media-coverage, etc.)", type: "text", required: true },
    { name: "title", label: "Title", type: "text" },
    { name: "body", label: "Body / Description", type: "textarea" },
    { name: "image_url", label: "Image", type: "image" },
  ];

  return (
    <div className="min-h-screen bg-gov-cream">
      <header className="bg-gov-navy text-primary-foreground">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="font-display text-xl font-black">Admin Dashboard</h1>
            <p className="text-xs opacity-80">Telangana ULB Portal · {email}</p>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <div className="min-w-[220px]">
              <Select value={ulbId} onValueChange={setUlbId}>
                <SelectTrigger className="bg-background text-foreground">
                  <SelectValue placeholder="Select ULB" />
                </SelectTrigger>
                <SelectContent>
                  {ulbs.map((u) => (
                    <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button asChild variant="secondary"><Link to="/">View site</Link></Button>
            <Button variant="destructive" onClick={logout}>Logout</Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        <Tabs defaultValue="ulbs">
          <TabsList className="flex flex-wrap h-auto">
            <TabsTrigger value="ulbs">ULBs</TabsTrigger>
            <TabsTrigger value="news">News</TabsTrigger>
            <TabsTrigger value="notices">Notices</TabsTrigger>
            <TabsTrigger value="banners">Banners</TabsTrigger>
            <TabsTrigger value="tenders">Tenders</TabsTrigger>
            <TabsTrigger value="leadership">Leadership</TabsTrigger>
            <TabsTrigger value="departments">Departments</TabsTrigger>
            <TabsTrigger value="gallery">Gallery</TabsTrigger>
            <TabsTrigger value="services">Services</TabsTrigger>
            <TabsTrigger value="council_members">Council Members</TabsTrigger>
            <TabsTrigger value="co_option_members">Co-option Members</TabsTrigger>
            <TabsTrigger value="public_representatives">Public Reps</TabsTrigger>
            <TabsTrigger value="pages">About Pages</TabsTrigger>
            <TabsTrigger value="grievances">Grievances</TabsTrigger>
          </TabsList>

          <TabsContent value="ulbs"><UlbsSection /></TabsContent>
          <TabsContent value="news"><CrudSection table="news" ulbId={ulbId} fields={newsFields} title="News" /></TabsContent>
          <TabsContent value="notices"><CrudSection table="notices" ulbId={ulbId} fields={noticesFields} title="Notices" /></TabsContent>
          <TabsContent value="banners"><CrudSection table="banners" ulbId={ulbId} fields={bannersFields} title="Banners" /></TabsContent>
          <TabsContent value="tenders"><CrudSection table="tenders" ulbId={ulbId} fields={tendersFields} title="Tenders" /></TabsContent>
          <TabsContent value="leadership"><CrudSection table="leadership" ulbId={ulbId} fields={leadershipFields} title="Leadership" /></TabsContent>
          <TabsContent value="departments"><CrudSection table="departments" ulbId={ulbId} fields={deptFields} title="Departments" /></TabsContent>
          <TabsContent value="gallery"><CrudSection table="gallery" ulbId={ulbId} fields={galleryFields} title="Gallery" /></TabsContent>
          <TabsContent value="services"><CrudSection table="services_info" ulbId={ulbId} fields={servicesFields} title="Services" /></TabsContent>
          <TabsContent value="council_members"><CrudSection table="council_members" ulbId={ulbId} fields={councilFields} title="Council Members" /></TabsContent>
          <TabsContent value="co_option_members"><CrudSection table="co_option_members" ulbId={ulbId} fields={coOptionFields} title="Co-option Members" /></TabsContent>
          <TabsContent value="public_representatives"><CrudSection table="public_representatives" ulbId={ulbId} fields={publicRepsFields} title="Public Representatives" /></TabsContent>
          <TabsContent value="pages"><CrudSection table="pages" ulbId={ulbId} fields={pagesFields} title="About / Content Pages" /></TabsContent>
          <TabsContent value="grievances"><GrievancesSection ulbId={ulbId} /></TabsContent>
        </Tabs>
      </main>
    </div>
  );
}