/**
 * Optimistic UI Updates Utility
 * Provides instant feedback to users while API calls are in progress
 */

export class OptimisticUpdate {
  constructor() {
    this.pendingUpdates = new Map();
  }

  /**
   * Apply optimistic update
   * @param {string} key - Unique identifier for the update
   * @param {Function} optimisticFn - Function to apply optimistic state
   * @param {Function} apiFn - Async function that performs the actual API call
   * @param {Function} rollbackFn - Function to rollback on error
   */
  async apply(key, optimisticFn, apiFn, rollbackFn) {
    // Apply optimistic update immediately
    const optimisticResult = optimisticFn();
    this.pendingUpdates.set(key, { optimisticResult, rollbackFn });

    try {
      // Perform actual API call
      const result = await apiFn();
      
      // Remove from pending updates on success
      this.pendingUpdates.delete(key);
      
      return { success: true, data: result };
    } catch (error) {
      // Rollback on error
      if (rollbackFn) {
        rollbackFn();
      }
      
      this.pendingUpdates.delete(key);
      
      return { success: false, error };
    }
  }

  /**
   * Check if update is pending
   */
  isPending(key) {
    return this.pendingUpdates.has(key);
  }

  /**
   * Clear all pending updates
   */
  clearAll() {
    this.pendingUpdates.clear();
  }
}

// Singleton instance
export const optimisticUpdates = new OptimisticUpdate();

/**
 * React Hook for optimistic updates
 */
export const useOptimisticUpdate = () => {
  const [pendingKeys, setPendingKeys] = React.useState(new Set());

  const applyUpdate = React.useCallback(async (key, optimisticFn, apiFn, rollbackFn) => {
    setPendingKeys(prev => new Set(prev).add(key));

    const result = await optimisticUpdates.apply(
      key,
      optimisticFn,
      apiFn,
      rollbackFn
    );

    setPendingKeys(prev => {
      const next = new Set(prev);
      next.delete(key);
      return next;
    });

    return result;
  }, []);

  const isPending = React.useCallback((key) => {
    return pendingKeys.has(key);
  }, [pendingKeys]);

  return { applyUpdate, isPending };
};

/**
 * Example usage:
 * 
 * const { applyUpdate, isPending } = useOptimisticUpdate();
 * 
 * const handleLike = async (postId) => {
 *   await applyUpdate(
 *     `like-${postId}`,
 *     // Optimistic update
 *     () => {
 *       setPosts(posts.map(p => 
 *         p.id === postId ? { ...p, liked: true, likes: p.likes + 1 } : p
 *       ));
 *     },
 *     // API call
 *     () => api.likePost(postId),
 *     // Rollback
 *     () => {
 *       setPosts(posts.map(p => 
 *         p.id === postId ? { ...p, liked: false, likes: p.likes - 1 } : p
 *       ));
 *     }
 *   );
 * };
 */

export default optimisticUpdates;
