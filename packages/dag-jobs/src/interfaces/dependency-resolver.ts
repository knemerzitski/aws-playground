
export interface DependencyResolver {
  resolveDependencies(complatedJobId: string): Promise<boolean>;
}
