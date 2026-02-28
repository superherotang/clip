"use client";

import React, { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";

export default function ApiDocsPage() {
  const t = useTranslations();
  const { showSuccess } = useToast();
  const [apiKey, setApiKey] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchApiKey = async () => {
      try {
        const response = await fetch("/api/auth/api-key");
        if (response.ok) {
          const data = await response.json();
          setApiKey(data.apiKey || "");
        }
      } catch (error) {
        console.error("Failed to fetch API key:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchApiKey();
  }, []);

  const copyApiKey = () => {
    navigator.clipboard.writeText(apiKey);
    showSuccess(t("Toast.copySuccess"));
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          {t("ApiDocs.title")}
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          {t("ApiDocs.description")}
        </p>
      </div>

      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
          {t("ApiDocs.apiKeyTitle")}
        </h2>
        {isLoading ? (
          <div className="text-center py-4 text-gray-500">
            {t("Common.loading")}
          </div>
        ) : apiKey ? (
          <>
            <div className="flex gap-2 items-center mb-4">
              <code className="flex-1 bg-gray-100 dark:bg-gray-700 px-3 py-2 rounded text-sm break-all">
                {apiKey}
              </code>
              <Button onClick={copyApiKey}>
                {t("Common.copy")}
              </Button>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {t("ApiDocs.usage")}{" "}
              <code className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                Authorization: Bearer YOUR_API_KEY
              </code>
            </p>
          </>
        ) : (
          <p className="text-gray-600 dark:text-gray-400">
            {t("ApiDocs.loginRequired")}{" "}
            <a href="/login" className="text-blue-600 hover:underline">
              {t("ApiDocs.loginLink")}
            </a>{" "}
            {t("ApiDocs.loginSuffix")}
          </p>
        )}
      </Card>

      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
          {t("ApiDocs.authentication.title")}
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          {t("ApiDocs.authentication.description")}
        </p>
        <pre className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg overflow-x-auto text-sm">
          <code>Authorization: Bearer YOUR_API_KEY</code>
        </pre>
      </Card>

      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
          {t("ApiDocs.endpoints.title")}
        </h2>

        <div className="space-y-6">
          {/* Get Rooms */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 px-2 py-1 rounded text-sm font-mono">
                GET
              </span>
              <code className="text-gray-900 dark:text-white">
                /api/external/rooms
              </code>
            </div>
            <p className="text-gray-600 dark:text-gray-400 mb-2">
              {t("ApiDocs.endpoints.getRooms.description")}
            </p>
            <h4 className="font-medium text-gray-900 dark:text-white mb-2">
              Response:
            </h4>
            <pre className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg overflow-x-auto text-sm">
              <code>{`{
  "rooms": [
    {
      "id": "uuid",
      "name": "Room Name",
      "code": "ABC123",
      "memberCount": 5,
      "clipboardCount": 10
    }
  ]
}`}</code>
            </pre>
          </div>

          {/* Get Clipboard */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 px-2 py-1 rounded text-sm font-mono">
                GET
              </span>
              <code className="text-gray-900 dark:text-white">
                /api/external/clipboard?roomId=ROOM_ID
              </code>
            </div>
            <p className="text-gray-600 dark:text-gray-400 mb-2">
              {t("ApiDocs.endpoints.getClipboard.description")}
            </p>
            <h4 className="font-medium text-gray-900 dark:text-white mb-2">
              Response:
            </h4>
            <pre className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg overflow-x-auto text-sm">
              <code>{`{
  "items": [
    {
      "id": "uuid",
      "type": "text",
      "content": "Clipboard content",
      "category": "work",
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}`}</code>
            </pre>
          </div>

          {/* Create Clipboard Item */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 px-2 py-1 rounded text-sm font-mono">
                POST
              </span>
              <code className="text-gray-900 dark:text-white">
                /api/external/clipboard
              </code>
            </div>
            <p className="text-gray-600 dark:text-gray-400 mb-2">
              {t("ApiDocs.endpoints.createClipboard.description")}
            </p>
            <h4 className="font-medium text-gray-900 dark:text-white mb-2">
              {t("ApiDocs.endpoints.createClipboard.bodyTitle")}
            </h4>
            <pre className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg overflow-x-auto text-sm mb-2">
              <code>{`{
  "roomId": "uuid",
  "type": "text",
  "content": "Your content",
  "category": "optional-category"
}`}</code>
            </pre>
          </div>

          {/* Delete Clipboard Item */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 px-2 py-1 rounded text-sm font-mono">
                DELETE
              </span>
              <code className="text-gray-900 dark:text-white">
                /api/external/clipboard?id=ITEM_ID
              </code>
            </div>
            <p className="text-gray-600 dark:text-gray-400">
              {t("ApiDocs.endpoints.deleteClipboard.description")}
            </p>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
          {t("ApiDocs.examples.title")}
        </h2>
        <h3 className="font-medium text-gray-900 dark:text-white mb-2">
          {t("ApiDocs.examples.curl")}
        </h3>
        <pre className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg overflow-x-auto text-sm mb-4">
          <code>{`# Get all rooms
curl -H "Authorization: Bearer YOUR_API_KEY" \\
  https://your-domain.com/api/external/rooms

# Get clipboard items
curl -H "Authorization: Bearer YOUR_API_KEY" \\
  "https://your-domain.com/api/external/clipboard?roomId=ROOM_ID"

# Create clipboard item
curl -X POST \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"roomId":"ROOM_ID","type":"text","content":"Hello World"}' \\
  https://your-domain.com/api/external/clipboard`}</code>
        </pre>
        <h3 className="font-medium text-gray-900 dark:text-white mb-2">
          {t("ApiDocs.examples.javascript")}
        </h3>
        <pre className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg overflow-x-auto text-sm">
          <code>{`const API_KEY = "YOUR_API_KEY";
const BASE_URL = "https://your-domain.com";

// Get rooms
const response = await fetch(\`\${BASE_URL}/api/external/rooms\`, {
  headers: {
    "Authorization": \`Bearer \${API_KEY}\`
  }
});
const data = await response.json();
console.log(data.rooms);

// Create clipboard item
await fetch(\`\${BASE_URL}/api/external/clipboard\`, {
  method: "POST",
  headers: {
    "Authorization": \`Bearer \${API_KEY}\`,
    "Content-Type": "application/json"
  },
  body: JSON.stringify({
    roomId: "ROOM_ID",
    type: "text",
    content: "Hello World"
  })
});`}</code>
        </pre>
      </Card>
    </div>
  );
}
