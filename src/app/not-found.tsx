import { ArrowLink, Label } from "@/components/ui";

export default function NotFound() {
  return (
    <section className="flex min-h-svh flex-col justify-center px-5 pt-24 md:px-8">
      <Label>Error · page not found</Label>
      <h1 className="mt-4 font-display text-[30vw] font-semibold leading-[0.8] tracking-tighter md:text-[22vw]">404</h1>
      <div className="mt-8 flex flex-wrap items-center justify-between gap-6">
        <p className="max-w-sm text-lg">Lorem ipsum: this page wandered off. Everything else is right where it was.</p>
        <ArrowLink href="/">Take me home</ArrowLink>
      </div>
    </section>
  );
}
