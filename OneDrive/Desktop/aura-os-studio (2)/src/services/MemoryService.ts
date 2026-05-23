/**
 * Memory API Service
 * Client-side API for memory chunk management
 */

export interface MemoryChunk {
  id: string;
  content: string;
  category: "George" | "Pebble" | "Charlie" | "Business" | "Family" | "General";
  tags: string[];
  weight: number;
  ts: number;
  chars: number;
}

class MemoryService {
  private baseUrl = "/api/memory";

  async getMemoryChunks(filter?: {
    category?: string;
    limit?: number;
  }): Promise<MemoryChunk[]> {
    try {
      const params = new URLSearchParams();
      if (filter?.category) params.set("category", filter.category);
      if (filter?.limit) params.set("limit", filter.limit.toString());

      const response = await fetch(`${this.baseUrl}?${params}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("Unauthorized");
        }
        throw new Error(`Failed to fetch memory: ${response.statusText}`);
      }

      const data = await response.json();
      return data.chunks || [];
    } catch (err) {
      console.error("Error fetching memory chunks:", err);
      return [];
    }
  }

  async createMemoryChunk(chunk: Omit<MemoryChunk, "id" | "ts">): Promise<MemoryChunk | null> {
    try {
      const response = await fetch(this.baseUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
        },
        body: JSON.stringify(chunk),
      });

      if (!response.ok) {
        throw new Error(`Failed to create memory: ${response.statusText}`);
      }

      const data = await response.json();
      return data.chunk;
    } catch (err) {
      console.error("Error creating memory chunk:", err);
      return null;
    }
  }

  async updateMemoryChunk(id: string, updates: Partial<MemoryChunk>): Promise<MemoryChunk | null> {
    try {
      const response = await fetch(`${this.baseUrl}/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
        },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        throw new Error(`Failed to update memory: ${response.statusText}`);
      }

      const data = await response.json();
      return data.chunk;
    } catch (err) {
      console.error("Error updating memory chunk:", err);
      return null;
    }
  }

  async deleteMemoryChunk(id: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to delete memory: ${response.statusText}`);
      }

      return true;
    } catch (err) {
      console.error("Error deleting memory chunk:", err);
      return false;
    }
  }

  async bulkCreateMemoryChunks(chunks: Omit<MemoryChunk, "id" | "ts">[]): Promise<MemoryChunk[]> {
    try {
      const response = await fetch(`${this.baseUrl}/bulk`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
        },
        body: JSON.stringify({ chunks }),
      });

      if (!response.ok) {
        throw new Error(`Failed to create memory chunks: ${response.statusText}`);
      }

      const data = await response.json();
      return data.chunks || [];
    } catch (err) {
      console.error("Error creating memory chunks:", err);
      return [];
    }
  }
}

export const memoryService = new MemoryService();
