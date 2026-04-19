# Day 3 - Backend API Quick Reference

## API Route Examples

### Create Workflow
```bash
POST /api/workflows
Content-Type: application/json

{
  "name": "My Workflow",
  "description": "Test workflow",
  "nodes": [],
  "edges": []
}

Response:
{
  "success": true,
  "data": {
    "id": "cuid123",
    "userId": "user123",
    "name": "My Workflow",
    "nodes": [],
    "edges": [],
    "createdAt": "2026-01-14T...",
    "updatedAt": "2026-01-14T..."
  }
}
```

### Execute Workflow
```bash
POST /api/workflows/cuid123/execute
Content-Type: application/json

{
  "workflowId": "cuid123",
  "scope": "full",
  "nodeIds": []
}

Response:
{
  "success": true,
  "data": {
    "runId": "run123",
    "status": "success",
    "duration": 5230,
    "nodeExecutions": [
      {
        "id": "exec1",
        "nodeId": "node1",
        "nodeType": "textNode",
        "nodeLabel": "Text Input",
        "status": "success",
        "inputs": {},
        "outputs": { "output": "..." },
        "duration": 100
      }
    ]
  }
}
```

### Get Workflow Runs
```bash
GET /api/workflows/cuid123/runs

Response:
{
  "success": true,
  "data": [
    {
      "id": "run123",
      "status": "success",
      "scope": "full",
      "nodeCount": 5,
      "duration": 5230,
      "startedAt": "2026-01-14T...",
      "completedAt": "2026-01-14T...",
      "nodeExecutions": [...]
    }
  ]
}
```

### Get Run Details
```bash
GET /api/runs/run123

Response:
{
  "success": true,
  "data": {
    "id": "run123",
    "workflowId": "wf123",
    "status": "success",
    "scope": "full",
    "duration": 5230,
    "startedAt": "...",
    "completedAt": "...",
    "nodeExecutions": [
      {
        "nodeId": "node1",
        "nodeType": "textNode",
        "nodeLabel": "Text Input",
        "status": "success",
        "inputs": {},
        "outputs": { "output": "Text content" },
        "duration": 100,
        "startedAt": "...",
        "completedAt": "..."
      }
    ]
  }
}
```

### Upload Image
```bash
POST /api/upload/image
Content-Type: multipart/form-data

file: [image file]

Response:
{
  "success": true,
  "data": {
    "url": "https://cdn.transloadit.com/mock/...",
    "fileName": "photo.jpg",
    "size": 524288,
    "type": "image/jpeg"
  }
}
```

---

## React Hook Examples

### Using useWorkflowAPI

```tsx
'use client';

import { useWorkflowAPI } from '@/hooks';

export function WorkflowManager() {
  const { createWorkflow, getWorkflow, updateWorkflow, deleteWorkflow, loading, error } = 
    useWorkflowAPI();

  const handleCreate = async () => {
    const workflow = await createWorkflow('New Workflow', 'Description');
    if (workflow) {
      console.log('Created:', workflow.id);
    }
  };

  const handleUpdate = async (id: string) => {
    const workflow = await updateWorkflow(id, {
      name: 'Updated Name',
      nodes: [...],
      edges: [...]
    });
    if (workflow) {
      console.log('Updated successfully');
    }
  };

  return (
    <div>
      <button onClick={handleCreate} disabled={loading}>
        {loading ? 'Creating...' : 'Create Workflow'}
      </button>
      {error && <p className="text-red-500">{error}</p>}
    </div>
  );
}
```

### Using useWorkflowExecution

```tsx
'use client';

import { useWorkflowExecution } from '@/hooks';
import { useState } from 'react';

export function WorkflowExecutor() {
  const { executeWorkflow, getWorkflowRuns, getRunDetails, loading } = useWorkflowExecution();
  const [runs, setRuns] = useState([]);

  const handleExecute = async (workflowId: string) => {
    const run = await executeWorkflow(workflowId, 'full');
    if (run) {
      console.log('Execution started:', run.id);
      // Fetch updated runs
      const allRuns = await getWorkflowRuns(workflowId);
      setRuns(allRuns);
    }
  };

  const handleViewRun = async (runId: string) => {
    const details = await getRunDetails(runId);
    if (details) {
      console.log('Run details:', details.nodeExecutions);
    }
  };

  return (
    <div>
      <button onClick={() => handleExecute('wf123')} disabled={loading}>
        {loading ? 'Executing...' : 'Run Workflow'}
      </button>
      
      {runs.map(run => (
        <div key={run.id}>
          <button onClick={() => handleViewRun(run.id)}>
            Run {run.id} - {run.status}
          </button>
        </div>
      ))}
    </div>
  );
}
```

### Using useFileUpload

```tsx
'use client';

import { useFileUpload } from '@/hooks';
import { useRef } from 'react';

export function FileUploader() {
  const { uploadImage, uploadVideo, loading, progress, error } = useFileUpload();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = await uploadImage(file);
      if (url) {
        console.log('Image uploaded:', url);
      }
    }
  };

  const handleVideoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = await uploadVideo(file);
      if (url) {
        console.log('Video uploaded:', url);
      }
    }
  };

  return (
    <div>
      <input
        type="file"
        accept="image/*"
        onChange={handleImageSelect}
        disabled={loading}
      />
      <input
        type="file"
        accept="video/*"
        onChange={handleVideoSelect}
        disabled={loading}
      />
      {loading && <p>Uploading: {progress}%</p>}
      {error && <p className="text-red-500">{error}</p>}
    </div>
  );
}
```

---

## Type Definitions

```typescript
// From useWorkflowAPI
interface Workflow {
  id: string;
  name: string;
  description?: string;
  nodes: Node[];
  edges: Edge[];
  viewport?: any;
  createdAt: string;
  updatedAt: string;
}

// From useWorkflowExecution
interface WorkflowRun {
  id: string;
  workflowId: string;
  status: 'running' | 'success' | 'failed' | 'partial';
  scope: 'full' | 'partial' | 'single';
  nodeCount: number;
  duration?: number;
  startedAt: string;
  completedAt?: string;
  nodeExecutions?: NodeExecution[];
}

interface NodeExecution {
  id: string;
  nodeId: string;
  nodeType: string;
  nodeLabel: string;
  status: 'pending' | 'running' | 'success' | 'failed';
  inputs?: any;
  outputs?: any;
  error?: string;
  duration?: number;
  startedAt?: string;
  completedAt?: string;
}

// From useFileUpload
interface UploadResponse {
  success: boolean;
  data?: {
    url: string;
    fileName: string;
    size: number;
    type: string;
  };
  error?: string;
}
```

---

## Common Patterns

### Execute and Display Results

```tsx
const [runs, setRuns] = useState<WorkflowRun[]>([]);
const { executeWorkflow, getWorkflowRuns } = useWorkflowExecution();

const handleExecute = async (workflowId: string) => {
  const result = await executeWorkflow(workflowId, 'full');
  if (result) {
    const updatedRuns = await getWorkflowRuns(workflowId);
    setRuns(updatedRuns);
  }
};
```

### Partial Execution

```tsx
const selectedNodeIds = ['node1', 'node3'];
const result = await executeWorkflow(workflowId, 'partial', selectedNodeIds);
```

### Single Node Execution

```tsx
const result = await executeWorkflow(workflowId, 'single', ['node5']);
```

### Error Handling

```tsx
const { executeWorkflow, error } = useWorkflowExecution();

const run = await executeWorkflow(workflowId);
if (!run && error) {
  // Handle error
  console.error('Execution failed:', error);
}
```

---

## Validation Rules

### Workflow Names
- Required, 1-255 characters
- No validation on content (symbols allowed)

### Node IDs (for partial execution)
- Must be valid node IDs from workflow
- Case-sensitive

### File Uploads
- Images: jpg, jpeg, png, webp, gif (max 50MB)
- Videos: mp4, mov, webm, m4v (max 500MB)

---

## Status Codes Reference

| Code | Meaning | Example |
|------|---------|---------|
| 200 | Success | Workflow executed |
| 201 | Created | Workflow created |
| 400 | Bad Request | Invalid DAG, validation failed |
| 401 | Unauthorized | No authenticated user |
| 403 | Forbidden | Not workflow owner |
| 404 | Not Found | Workflow/run doesn't exist |
| 500 | Server Error | Database error, execution failure |

---

## Next Steps for Frontend Integration

1. **Workflow Page Component**
   - Add `useWorkflowAPI` to save/load workflows
   - Add `useWorkflowExecution` for play button

2. **Right Sidebar Component**
   - Use `getWorkflowRuns()` to list executions
   - Use `getRunDetails()` to show node-level history

3. **Canvas Nodes Component**
   - Add status visualization
   - Add pulsating glow on running nodes
   - Display execution results inline

4. **Upload Nodes Component**
   - Use `useFileUpload` for image/video uploads
   - Show preview after upload

5. **Real-time Updates**
   - Add polling/WebSocket for live status
   - Update node status as execution progresses
