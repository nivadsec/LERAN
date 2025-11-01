import DashboardLayout from "@/app/dashboard/layout";

export default function AdminArticlesLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <DashboardLayout>{children}</DashboardLayout>;
}

    