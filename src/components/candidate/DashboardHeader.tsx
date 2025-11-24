"use client";

export const DashboardHeader = () => {
  return (
    <header className="flex items-center justify-center p-6 bg-background border-border">
      <div>
        <h1 className="text-2xl font-bold items-center text-center text-foreground">
          My Applications
        </h1>
        <p className="text-muted-foreground">
          Track your applications and progress
        </p>
      </div>
    </header>
  );
};
