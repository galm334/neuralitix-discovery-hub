export const Stats = () => {
  return (
    <div className="mt-20 hidden md:grid grid-cols-4 gap-8 text-center">
      <div>
        <h3 className="text-4xl font-bold text-primary mb-2">1,000+</h3>
        <p className="text-muted-foreground">AI Agents</p>
      </div>
      <div>
        <h3 className="text-4xl font-bold text-primary mb-2">50K+</h3>
        <p className="text-muted-foreground">Daily Users</p>
      </div>
      <div>
        <h3 className="text-4xl font-bold text-primary mb-2">24/7</h3>
        <p className="text-muted-foreground">Updates</p>
      </div>
      <div>
        <h3 className="text-4xl font-bold text-primary mb-2">100%</h3>
        <p className="text-muted-foreground">Free</p>
      </div>
    </div>
  );
};