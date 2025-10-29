import DashboardLayout from "@/app/dashboard/layout";

export default function AdminAnnouncementsLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <DashboardLayout>{children}</DashboardLayout>;
}
