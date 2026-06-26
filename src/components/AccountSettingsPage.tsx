import React from "react";
import { UserDashboardPage } from "./UserDashboardPage";

interface AccountSettingsPageProps {
  onBack: () => void;
  currentUser: { name: string; email: string; plan?: string } | null;
  onLogout: () => void;
  onUpdateUser?: (user: { name: string; email: string; plan?: string }) => void;
  onPricingClick?: () => void;
}

export function AccountSettingsPage({ 
  onBack, 
  currentUser, 
  onLogout, 
  onUpdateUser, 
  onPricingClick 
}: AccountSettingsPageProps) {
  return (
    <UserDashboardPage
      onBack={onBack}
      currentUser={currentUser}
      onLogout={onLogout}
      onUpdateUser={onUpdateUser}
      onManageSubscription={onPricingClick || (() => {})}
      onToolSelect={() => {}}
      onBrowseTools={() => {}}
      jobs={[]}
      initialTab="profile"
    />
  );
}
export default AccountSettingsPage;
