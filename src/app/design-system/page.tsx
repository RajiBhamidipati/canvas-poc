"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import Link from "next/link";

// Finova colour palette
const COLOURS = [
  { name: "Finova Dark", hex: "#1F1F1F", css: "--foreground", usage: "Headers, text, primary buttons" },
  { name: "Lime Accent", hex: "#ECF3B7", css: "--primary", usage: "Brand highlight, CTAs, hover states" },
  { name: "Blue", hex: "#6686F7", css: "--secondary", usage: "Links, active states, info badges" },
  { name: "Soft Purple", hex: "#F3EBFA", css: "--accent", usage: "Card backgrounds, subtle highlights" },
  { name: "Light Grey", hex: "#F7F7F7", css: "--background", usage: "Page background" },
  { name: "White", hex: "#FFFFFF", css: "--card", usage: "Cards, panels" },
  { name: "Green", hex: "#16A34A", css: "semantic", usage: "Success, verified, approved" },
  { name: "Amber", hex: "#D97706", css: "semantic", usage: "Warning, pending, review" },
  { name: "Red", hex: "#DC2626", css: "semantic", usage: "Error, rejected, alert, destructive" },
];

// Sample customer data for the table
const SAMPLE_CUSTOMERS = [
  { id: "CUST-123", name: "Sarah Miller", tier: "Premier", risk: "Low", kyc: "Verified", products: 4, pending: true },
  { id: "CUST-456", name: "Ahmed Hassan", tier: "Business", risk: "Medium", kyc: "Verified", products: 3, pending: true },
  { id: "CUST-789", name: "Yuki Tanaka", tier: "Premier", risk: "High", kyc: "Verified", products: 5, pending: false },
  { id: "CUST-012", name: "James Wilson", tier: "Standard", risk: "Low", kyc: "Expired", products: 2, pending: false },
  { id: "CUST-345", name: "Lisa Rodriguez", tier: "Standard", risk: "High", kyc: "Verified", products: 4, pending: true },
];

const SECTIONS = [
  "Brand", "Typography", "Colours", "Buttons", "Cards", "Forms",
  "Badges", "Table", "Tabs", "Dialog", "Tooltips", "Avatars",
];

function SectionHeading({ id, title, description }: { id: string; title: string; description: string }) {
  return (
    <div id={id} className="scroll-mt-20 space-y-1 pt-8 pb-4">
      <h2 className="text-xl font-bold tracking-tight">{title}</h2>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  );
}

export default function DesignSystemPage() {
  const [formName, setFormName] = useState("");
  const [formEmail, setFormEmail] = useState("");

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="sticky top-0 z-50 bg-[#1F1F1F] text-white px-6 py-3 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold tracking-tight">
              <span className="text-[#ECF3B7]">F</span>INOVA
              <span className="text-xs font-normal text-white/60 ml-2">Design System</span>
            </h1>
            <p className="text-[10px] text-white/40">
              Shadcn/UI &middot; Tailwind CSS &middot; Urbanist
            </p>
          </div>
          <Link href="/">
            <Button
              variant="outline"
              size="sm"
              className="text-xs rounded-full border-white/20 text-white hover:bg-white/10 hover:text-white"
            >
              Back to App
            </Button>
          </Link>
        </header>

        <div className="flex">
          {/* Sidebar navigation */}
          <nav className="hidden lg:block w-48 flex-shrink-0 sticky top-[60px] h-[calc(100vh-60px)] overflow-y-auto border-r px-4 py-6">
            <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-3">Components</p>
            <div className="space-y-1">
              {SECTIONS.map((section) => (
                <a
                  key={section}
                  href={`#${section.toLowerCase()}`}
                  className="block text-sm text-muted-foreground hover:text-foreground transition-colors py-1"
                >
                  {section}
                </a>
              ))}
            </div>
          </nav>

          {/* Main content */}
          <main className="flex-1 max-w-4xl mx-auto px-6 pb-20">

            {/* ── BRAND ── */}
            <SectionHeading id="brand" title="Brand" description="Finova brand identity and visual language." />
            <Card>
              <CardContent className="pt-6 space-y-4">
                <div className="flex items-center gap-4">
                  <div className="bg-[#1F1F1F] text-white px-6 py-3 rounded-2xl">
                    <span className="text-2xl font-bold tracking-tight">
                      <span className="text-[#ECF3B7]">F</span>INOVA
                    </span>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    <p>Font: <span className="font-medium text-foreground">Urbanist</span></p>
                    <p>Border radius: <span className="font-medium text-foreground">0.75rem (12px)</span></p>
                    <p>Style: <span className="font-medium text-foreground">Modern, clean, accessible</span></p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* ── TYPOGRAPHY ── */}
            <SectionHeading id="typography" title="Typography" description="Urbanist font family with a clear type scale." />
            <Card>
              <CardContent className="pt-6 space-y-4">
                <div className="space-y-3">
                  <h1 className="text-4xl font-bold tracking-tight">Heading 1 — The quick brown fox</h1>
                  <h2 className="text-3xl font-bold tracking-tight">Heading 2 — jumps over the lazy dog</h2>
                  <h3 className="text-2xl font-semibold">Heading 3 — Pack my box with five dozen</h3>
                  <h4 className="text-xl font-semibold">Heading 4 — liquor jugs</h4>
                  <h5 className="text-lg font-medium">Heading 5 — How vexingly quick daft zebras jump</h5>
                  <p className="text-base">Body text — The five boxing wizards jump quickly. This is the default body text size used throughout the application for paragraphs and general content.</p>
                  <p className="text-sm text-muted-foreground">Small text — Used for captions, metadata, and secondary information throughout the UI.</p>
                  <p className="text-xs text-muted-foreground">Extra small — Used for timestamps, badges, and inline labels.</p>
                  <code className="block bg-muted rounded-md px-3 py-2 text-sm font-mono">
                    Code block — font-mono: &apos;Courier New&apos;, monospace
                  </code>
                </div>
              </CardContent>
            </Card>

            {/* ── COLOURS ── */}
            <SectionHeading id="colours" title="Colours" description="Finova brand palette with semantic colour tokens." />
            <div className="grid grid-cols-3 gap-3">
              {COLOURS.map((colour) => (
                <div key={colour.hex} className="rounded-lg border overflow-hidden">
                  <div
                    className="h-16 w-full"
                    style={{ backgroundColor: colour.hex }}
                  />
                  <div className="p-2.5 space-y-0.5">
                    <p className="text-sm font-medium">{colour.name}</p>
                    <p className="text-xs font-mono text-muted-foreground">{colour.hex}</p>
                    <p className="text-[10px] text-muted-foreground">{colour.usage}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* ── BUTTONS ── */}
            <SectionHeading id="buttons" title="Buttons" description="All button variants, sizes, and states." />
            <Card>
              <CardContent className="pt-6 space-y-6">
                {/* Variants */}
                <div className="space-y-2">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Variants</p>
                  <div className="flex flex-wrap gap-2">
                    <Button>Primary</Button>
                    <Button variant="secondary">Secondary</Button>
                    <Button variant="destructive">Destructive</Button>
                    <Button variant="outline">Outline</Button>
                    <Button variant="ghost">Ghost</Button>
                    <Button variant="link">Link</Button>
                  </div>
                </div>

                {/* Sizes */}
                <div className="space-y-2">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Sizes</p>
                  <div className="flex items-center gap-2">
                    <Button size="sm">Small</Button>
                    <Button>Default</Button>
                    <Button size="lg">Large</Button>
                    <Button size="icon">
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                      </svg>
                    </Button>
                  </div>
                </div>

                {/* States */}
                <div className="space-y-2">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">States</p>
                  <div className="flex items-center gap-2">
                    <Button>Enabled</Button>
                    <Button disabled>Disabled</Button>
                    <Button className="rounded-full">Pill Shape</Button>
                    <Button className="bg-green-600 hover:bg-green-700 text-white">Approve</Button>
                    <Button className="bg-blue-600 hover:bg-blue-700 text-white">Amend</Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* ── CARDS ── */}
            <SectionHeading id="cards" title="Cards" description="Content containers with various layouts." />
            <div className="grid grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Content Card</CardTitle>
                  <CardDescription>A standard card with title and description.</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">Cards are used throughout the application to group related content and actions.</p>
                </CardContent>
              </Card>

              <Card className="border-green-200 bg-green-50">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2 mb-2">
                    <svg className="h-5 w-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    <p className="font-medium text-green-800">Success State</p>
                  </div>
                  <p className="text-sm text-green-600">Operation completed successfully. This card variant is used for confirmations.</p>
                </CardContent>
              </Card>

              <Card className="border-red-200 bg-red-50">
                <CardContent className="pt-6">
                  <p className="font-medium text-red-800 mb-1">Alert Card</p>
                  <p className="text-sm text-red-600">Used for warnings, errors, and critical compliance flags like fraud alerts.</p>
                </CardContent>
              </Card>

              <Card className="border-amber-200 bg-amber-50">
                <CardContent className="pt-6">
                  <p className="font-medium text-amber-800 mb-1">Warning Card</p>
                  <p className="text-sm text-amber-700">Used for pending items, overdue reviews, and attention-needed states.</p>
                </CardContent>
              </Card>
            </div>

            {/* ── FORMS ── */}
            <SectionHeading id="forms" title="Forms" description="Input fields, labels, and form controls." />
            <Card>
              <CardContent className="pt-6 space-y-4 max-w-md">
                <div>
                  <Label htmlFor="ds-name">Full Name</Label>
                  <Input
                    id="ds-name"
                    placeholder="Enter customer name"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="ds-email">Email Address</Label>
                  <Input
                    id="ds-email"
                    type="email"
                    placeholder="customer@example.co.uk"
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="ds-postcode">Postcode (with validation)</Label>
                  <Input id="ds-postcode" placeholder="SW1A 2AA" className="border-destructive" />
                  <p className="text-xs text-destructive mt-1">Enter a valid UK postcode</p>
                </div>
                <div>
                  <Label htmlFor="ds-select">Select Reason</Label>
                  <select
                    id="ds-select"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  >
                    <option>Customer moved house</option>
                    <option>Previous address incorrect</option>
                    <option>Returned mail / gone away</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="ds-disabled">Disabled Input</Label>
                  <Input id="ds-disabled" value="Read-only value" disabled />
                </div>
              </CardContent>
            </Card>

            {/* ── BADGES ── */}
            <SectionHeading id="badges" title="Badges" description="Status indicators and labels used across the application." />
            <Card>
              <CardContent className="pt-6 space-y-4">
                <div className="space-y-2">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Shadcn Variants</p>
                  <div className="flex flex-wrap gap-2">
                    <Badge>Default</Badge>
                    <Badge variant="secondary">Secondary</Badge>
                    <Badge variant="destructive">Destructive</Badge>
                    <Badge variant="outline">Outline</Badge>
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Compliance Badges</p>
                  <div className="flex flex-wrap gap-2">
                    <span className="inline-flex items-center rounded-md border px-2 py-0.5 text-[10px] font-medium bg-green-50 text-green-700 border-green-200">KYC: verified</span>
                    <span className="inline-flex items-center rounded-md border px-2 py-0.5 text-[10px] font-medium bg-amber-50 text-amber-700 border-amber-200">KYC: expired</span>
                    <span className="inline-flex items-center rounded-md border px-2 py-0.5 text-[10px] font-medium bg-green-50 text-green-700 border-green-200">AML: clear</span>
                    <span className="inline-flex items-center rounded-md border px-2 py-0.5 text-[10px] font-medium bg-red-50 text-red-700 border-red-200">AML: alert</span>
                    <span className="inline-flex items-center rounded-md border px-2 py-0.5 text-[10px] font-medium bg-green-50 text-green-700 border-green-200">Risk: low</span>
                    <span className="inline-flex items-center rounded-md border px-2 py-0.5 text-[10px] font-medium bg-amber-50 text-amber-700 border-amber-200">Risk: medium</span>
                    <span className="inline-flex items-center rounded-md border px-2 py-0.5 text-[10px] font-medium bg-red-50 text-red-700 border-red-200">Risk: high</span>
                    <span className="inline-flex items-center rounded-md border px-2 py-0.5 text-[10px] font-medium bg-amber-50 text-amber-700 border-amber-200">PEP</span>
                    <span className="inline-flex items-center rounded-md border px-2 py-0.5 text-[10px] font-medium bg-red-100 text-red-800 border-red-300 animate-pulse">FRAUD: under-review</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Product Badges</p>
                  <div className="flex flex-wrap gap-2">
                    <span className="inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 text-[10px] bg-background">
                      <span className="font-medium">Current Account</span>
                      <span className="text-muted-foreground">****4401</span>
                      <span className="text-muted-foreground">£3,240.50</span>
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 text-[10px] bg-red-50 border-red-200">
                      <span className="font-medium">Credit Card</span>
                      <span className="text-muted-foreground">****3452</span>
                      <span className="text-red-600">arrears</span>
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Task & Origin Badges</p>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary" className="text-[10px] font-mono">T862-00451</Badge>
                    <Badge variant="outline">Pending Approval</Badge>
                    <div className="rounded-md bg-muted/50 px-2 py-1 text-[10px]">
                      Origin: <span className="font-medium">Call Centre</span>
                    </div>
                    <div className="rounded-md bg-muted/50 px-2 py-1 text-[10px]">
                      Origin: <span className="font-medium">eBanking Self-Service</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* ── TABLE ── */}
            <SectionHeading id="table" title="Table" description="Data tables for customer lists and product portfolios." />
            <Card>
              <CardContent className="pt-6">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Customer ID</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Tier</TableHead>
                      <TableHead>Risk</TableHead>
                      <TableHead>KYC</TableHead>
                      <TableHead className="text-center">Products</TableHead>
                      <TableHead className="text-center">Pending</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {SAMPLE_CUSTOMERS.map((c) => (
                      <TableRow key={c.id}>
                        <TableCell className="font-mono text-xs">{c.id}</TableCell>
                        <TableCell className="font-medium">{c.name}</TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="text-[10px]">{c.tier}</Badge>
                        </TableCell>
                        <TableCell>
                          <span className={`inline-flex items-center rounded-md border px-1.5 py-0.5 text-[10px] font-medium ${
                            c.risk === "Low" ? "bg-green-50 text-green-700 border-green-200" :
                            c.risk === "Medium" ? "bg-amber-50 text-amber-700 border-amber-200" :
                            "bg-red-50 text-red-700 border-red-200"
                          }`}>
                            {c.risk}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className={`inline-flex items-center rounded-md border px-1.5 py-0.5 text-[10px] font-medium ${
                            c.kyc === "Verified" ? "bg-green-50 text-green-700 border-green-200" : "bg-amber-50 text-amber-700 border-amber-200"
                          }`}>
                            {c.kyc}
                          </span>
                        </TableCell>
                        <TableCell className="text-center">{c.products}</TableCell>
                        <TableCell className="text-center">
                          {c.pending ? (
                            <span className="inline-flex h-2 w-2 rounded-full bg-amber-400" />
                          ) : (
                            <span className="inline-flex h-2 w-2 rounded-full bg-muted" />
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* ── TABS ── */}
            <SectionHeading id="tabs" title="Tabs" description="Tabbed content panels for organising complex views." />
            <Card>
              <CardContent className="pt-6">
                <Tabs defaultValue="change">
                  <TabsList>
                    <TabsTrigger value="change">Change Details</TabsTrigger>
                    <TabsTrigger value="compliance">Compliance</TabsTrigger>
                    <TabsTrigger value="profile">Customer Profile</TabsTrigger>
                  </TabsList>
                  <TabsContent value="change" className="space-y-3">
                    <div className="flex items-center gap-2 mt-3">
                      <div className="flex-1 rounded-md bg-red-50 border border-red-200 p-2.5">
                        <p className="text-xs font-medium text-red-600 mb-1">Before</p>
                        <p className="text-sm">10 Downing Street</p>
                        <p className="text-xs text-muted-foreground">London, SW1A 2AA</p>
                      </div>
                      <svg className="h-4 w-4 text-muted-foreground flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                      <div className="flex-1 rounded-md bg-green-50 border border-green-200 p-2.5">
                        <p className="text-xs font-medium text-green-600 mb-1">After</p>
                        <p className="text-sm">221B Baker Street</p>
                        <p className="text-xs text-muted-foreground">London, NW1 6XE</p>
                      </div>
                    </div>
                  </TabsContent>
                  <TabsContent value="compliance" className="mt-3">
                    <div className="flex flex-wrap gap-1.5">
                      <span className="inline-flex items-center rounded-md border px-2 py-0.5 text-[10px] font-medium bg-green-50 text-green-700 border-green-200">KYC: verified</span>
                      <span className="inline-flex items-center rounded-md border px-2 py-0.5 text-[10px] font-medium bg-green-50 text-green-700 border-green-200">Risk: low</span>
                      <span className="inline-flex items-center rounded-md border px-2 py-0.5 text-[10px] font-medium bg-green-50 text-green-700 border-green-200">AML: clear</span>
                      <span className="inline-flex items-center rounded-md border px-2 py-0.5 text-[10px] font-medium bg-green-50 text-green-700 border-green-200">Sanctions: clear</span>
                    </div>
                  </TabsContent>
                  <TabsContent value="profile" className="mt-3">
                    <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                      <span className="text-muted-foreground">Credit Score</span>
                      <span className="font-medium">742 (Experian)</span>
                      <span className="text-muted-foreground">Segment</span>
                      <span className="font-medium">Retail</span>
                      <span className="text-muted-foreground">Customer Since</span>
                      <span className="font-medium">Jun 2014</span>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

            {/* ── DIALOG ── */}
            <SectionHeading id="dialog" title="Dialog" description="Modal dialogs for confirmations and detailed views." />
            <Card>
              <CardContent className="pt-6">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button>Open Confirmation Dialog</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Confirm Address Change</DialogTitle>
                      <DialogDescription>
                        Are you sure you want to update the address for CUST-123? This action will be logged to the audit trail and cannot be undone without manager approval.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="flex items-center gap-2 my-2">
                      <div className="flex-1 rounded-md bg-red-50 border border-red-200 p-2 text-xs">
                        <p className="font-medium text-red-600">Before</p>
                        <p>10 Downing Street, London</p>
                      </div>
                      <div className="flex-1 rounded-md bg-green-50 border border-green-200 p-2 text-xs">
                        <p className="font-medium text-green-600">After</p>
                        <p>221B Baker Street, London</p>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline">Cancel</Button>
                      <Button>Confirm</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>

            {/* ── TOOLTIPS ── */}
            <SectionHeading id="tooltips" title="Tooltips" description="Contextual hints shown on hover." />
            <Card>
              <CardContent className="pt-6">
                <div className="flex gap-4">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="outline">Hover for info</Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>This tooltip provides additional context</p>
                    </TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className="inline-flex items-center rounded-md border px-2 py-0.5 text-[10px] font-medium bg-green-50 text-green-700 border-green-200 cursor-help">
                        KYC: verified
                      </span>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Last verified: 20 Nov 2025</p>
                    </TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className="inline-flex items-center rounded-md border px-2 py-0.5 text-[10px] font-medium bg-red-100 text-red-800 border-red-300 cursor-help">
                        FRAUD: under-review
                      </span>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Unusual transaction pattern detected — 4 ATM withdrawals in 2 hours</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
              </CardContent>
            </Card>

            {/* ── AVATARS ── */}
            <SectionHeading id="avatars" title="Avatars" description="User and customer avatars with initials fallback." />
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Avatar>
                      <AvatarFallback>SM</AvatarFallback>
                    </Avatar>
                    <div className="text-sm">
                      <p className="font-medium">Sarah Miller</p>
                      <p className="text-xs text-muted-foreground">CUST-123</p>
                    </div>
                  </div>
                  <Separator orientation="vertical" className="h-10" />
                  <div className="flex items-center gap-2">
                    <Avatar>
                      <AvatarFallback className="bg-blue-100 text-blue-700">AH</AvatarFallback>
                    </Avatar>
                    <div className="text-sm">
                      <p className="font-medium">Ahmed Hassan</p>
                      <p className="text-xs text-muted-foreground">CUST-456</p>
                    </div>
                  </div>
                  <Separator orientation="vertical" className="h-10" />
                  <div className="flex items-center gap-2">
                    <Avatar>
                      <AvatarFallback className="bg-purple-100 text-purple-700">YT</AvatarFallback>
                    </Avatar>
                    <div className="text-sm">
                      <p className="font-medium">Yuki Tanaka</p>
                      <p className="text-xs text-muted-foreground">CUST-789</p>
                    </div>
                  </div>
                  <Separator orientation="vertical" className="h-10" />
                  <div className="flex items-center gap-2">
                    <Avatar>
                      <AvatarFallback className="bg-amber-100 text-amber-700">JW</AvatarFallback>
                    </Avatar>
                    <div className="text-sm">
                      <p className="font-medium">James Wilson</p>
                      <p className="text-xs text-muted-foreground">CUST-012</p>
                    </div>
                  </div>
                  <Separator orientation="vertical" className="h-10" />
                  <div className="flex items-center gap-2">
                    <Avatar>
                      <AvatarFallback className="bg-red-100 text-red-700">LR</AvatarFallback>
                    </Avatar>
                    <div className="text-sm">
                      <p className="font-medium">Lisa Rodriguez</p>
                      <p className="text-xs text-muted-foreground">CUST-345</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* ── SEPARATOR ── */}
            <Separator className="my-12" />

            {/* Footer */}
            <div className="text-center text-xs text-muted-foreground space-y-1">
              <p>
                <span className="font-medium">Finova Canvas</span> Design System &middot; Built with Shadcn/UI + Tailwind CSS
              </p>
              <p>12 component families &middot; Urbanist typography &middot; 9 colour tokens</p>
            </div>
          </main>
        </div>
      </div>
    </TooltipProvider>
  );
}
