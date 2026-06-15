const BASE_URL = "https://api.optiqare.com";

const commonUnauthorized = `{
  "message": "Unauthorized"
}`;

const common429 = `Too Many Requests.`;

const commonError = `{
  "errors": [
    {
      "element_name": "",
      "user_message": "",
      "developer_message": "",
      "more_info": "",
      "error_code": "100"
    }
  ],
  "transaction_id": "TRANSACTION_ID"
}`;

const imageNotFound = `{
  "errors": [
    {
      "element_name": "image_fax",
      "user_message": "Cannot get fax image",
      "developer_message": "Cannot retrieve fax tiff for fax_id: a3f3e7d2-...",
      "more_info": "",
      "error_code": "102"
    }
  ],
  "transaction_id": "TRANSACTION_ID"
}`;

const report400 = `{
  "errors": [
    {
      "error_code": "BAD_REQUEST",
      "element_name": "app_id",
      "developer_message": "Mandatory Field: app-id",
      "user_message": "Please enter a valid value for the app-id field."
    },
    {
      "error_code": "BAD_REQUEST",
      "element_name": "fax_number",
      "developer_message": "fax number failed validation - invalid phone number format",
      "user_message": "Please supply a valid telephone number."
    }
  ]
}`;

const report401 = `{
  "errors": [
    {
      "error_code": "UNAUTHORIZED",
      "developer_message": "Authentication values are missing or invalid."
    }
  ]
}`;

const report403 = `{
  "errors": [
    {
      "error_code": "FORBIDDEN",
      "developer_message": "Access to the resource is forbidden to the authenticated user.",
      "user_message": "Access to this item is not allowed."
    }
  ]
}`;

const report404 = `{
  "errors": [
    {
      "error_code": "NOT_FOUND",
      "developer_message": "Requested resource was not found.",
      "user_message": "Sorry, we were unable to find the item you were looking for."
    }
  ]
}`;

const report429 = `{
  "error_code": "string",
  "element_name": "string",
  "developer_message": "string",
  "user_message": "string",
  "more_info": "string"
}`;

const report500 = `{
  "errors": [
    {
      "error_code": "INTERNAL_SERVER_ERROR",
      "developer_message": "An internal error occurred.",
      "user_message": "An internal error occurred."
    }
  ]
}`;

const standardHeaders = [
  ["user-id", "string REQUIRED", "The unique identifier of the user making the API call."],
  ["transaction-id", "string", "The transaction ID for tracking the API call."],
  ["Authorization", "string REQUIRED", "The authorization token for accessing the API."]
];

const adminHeaders = [
  ["admin-id", "string", "The unique ID of the admin user accessing the reports."],
  ["admin-password", "string", "The password of the admin user accessing the reports."],
  ["admin-username", "string", "The username of the admin user accessing the reports."],
  ["transaction-id", "string", "The unique transaction ID associated with the report."]
];

const standardResponses = (successCode, successBody, extra = []) => [
  { code: successCode, label: "Object", body: successBody },
  ...extra,
  { code: "401", label: "Object", body: commonUnauthorized },
  { code: "429", label: "Object", body: common429 },
  { code: "500", label: "Object", body: commonError }
];

const endpoints = [
  {
    id: "tokens",
    title: "/tokens",
    method: "POST",
    path: "/tokens",
    url: `${BASE_URL}/tokens`,
    description:
      "Mapped to AWS Cognito's /oauth2/token endpoint, this request allows users to retrieve access tokens for authenticating and authorizing Mainstay Fax client applications.",
    headers: [
      ["Authorization", "string REQUIRED", "Contains the credentials used to authenticate the client making the request for authorization purposes."]
    ],
    bodyParams: [
      ["grant_type", "string", "Specifies the authorization grant type requested by the OAuth2 token endpoint."],
      ["scope", "string", "Defines the scope of the access request and the resources the token can access."]
    ],
    body: `{
  "grant_type": "client_credentials",
  "scope": "mainstay-infra-prod-pool-res-server/read mainstay-infra-prod-pool-res-server/write"
}`,
    responses: [
      {
        code: "200",
        label: "Object",
        body: `{
  "access_token": "eyJraWQiO...",
  "expires_in": 3600,
  "token_type": "Bearer"
}`
      },
      { code: "429", label: "Object", body: common429 },
      { code: "500", label: "Object", body: `Internal error.` }
    ],
    attributes: [
      ["access_token", "string", "Bearer token used for authenticated Mainstay Fax requests."],
      ["expires_in", "number", "Token lifetime, returned in seconds."],
      ["token_type", "string", "Token type returned by the authorization service."]
    ]
  },
  {
    id: "health",
    title: "/health",
    method: "GET",
    path: "/opc/v1/health",
    url: `${BASE_URL}/opc/v1/health`,
    description: "Allows users to check the current health status of the service.",
    headers: [["Authorization", "string REQUIRED", "The authorization token for accessing the API."]],
    responses: standardResponses(
      "200",
      `{
  "status": "UP"
}`
    ),
    attributes: [["status", "string", "Current health status of the service."]]
  },
  {
    id: "faxes-received",
    title: "/faxes/received",
    method: "GET",
    path: "/opc/v1/faxes/received",
    url: `${BASE_URL}/opc/v1/faxes/received`,
    description:
      "Retrieves a list of faxes received by the user, including fax IDs, size, duration, pages, timestamps, originating fax number, and destination fax number.",
    headers: [
      ...standardHeaders.slice(0, 2),
      ["pagination-limit", "string", "Maximum number of received faxes to return in a single response."],
      ["pagination-offset", "string", "Starting point for fetching received faxes in the API response."],
      standardHeaders[2]
    ],
    responses: standardResponses(
      "200",
      `{
  "first_record": 1,
  "last_record": 1,
  "faxes": [
    {
      "fax_id": "ec048b91-3589-489b-8e95-a067e50d92a8",
      "size": 123,
      "duration": 38,
      "pages": 2,
      "image_downloaded": false,
      "completed_timestamp": "2024-11-26T20:09:13+00:00",
      "originating_fax_number": "unavailable",
      "destination_fax_number": "+12345678910",
      "originating_fax_tsid": "unavailable"
    }
  ]
}`
    ),
    attributes: [
      ["first_record", "number", "First record returned in this page."],
      ["last_record", "number", "Last record returned in this page."],
      ["faxes", "array", "Received fax records."]
    ]
  },
  {
    id: "faxes-sent",
    title: "/faxes/sent",
    method: "GET",
    path: "/opc/v1/faxes/sent",
    displayPath: "/opc/v1/faxes/sent?transmission_status=COMPLETE",
    url: `${BASE_URL}/opc/v1/faxes/sent?transmission_status=COMPLETE`,
    description:
      "Retrieves information for sent faxes, including size, pages, status, routing data, transmission status, and client tracking data.",
    headers: [
      ...standardHeaders.slice(0, 2),
      ["pagination-limit", "string", "Maximum number of sent faxes to return in a single response."],
      ["pagination-offset", "string", "Starting point for retrieving sent faxes."],
      standardHeaders[2]
    ],
    queryParams: [["transmission_status", "string", "Filters sent faxes by transmission status, such as COMPLETE."]],
    responses: standardResponses(
      "200",
      `{
  "first_record": 1,
  "last_record": 1,
  "faxes": [
    {
      "fax_id": "ec048b91-3589-489b-8e95-a067e50d92a8",
      "size": 123,
      "duration": 5,
      "pages": 1,
      "image_downloaded": false,
      "fax_status": "STORED",
      "completed_timestamp": "2024-11-20T21:28:44+00:00",
      "originating_fax_number": "+12345678910",
      "destination_fax_number": "+12345678910",
      "transmission_data": {
        "transmission_status": "COMPLETE",
        "billable_retries": null,
        "error_code": "",
        "error_message": ""
      }
    }
  ]
}`
    ),
    attributes: [
      ["first_record", "number", "First record returned in this page."],
      ["last_record", "number", "Last record returned in this page."],
      ["faxes", "array", "Sent fax records."]
    ]
  },
  {
    id: "faxes-metadata",
    title: "/faxes/metadata",
    method: "POST",
    path: "/opc/v1/faxes/metadata",
    url: `${BASE_URL}/opc/v1/faxes/metadata`,
    description:
      "Retrieves metadata for specified fax IDs, including fax size, duration, page count, status, direction, and fax numbers.",
    headers: standardHeaders,
    bodyParams: [["fax_ids", "array", "List of unique fax identifiers to retrieve metadata for."]],
    body: `{
  "fax_ids": [
    "ec048b91-3589-489b-8e95-a067e50d92a8"
  ]
}`,
    responses: standardResponses(
      "200",
      `[
  {
    "fax_id": "ec048b91-3589-489b-8e95-a067e50d92a8",
    "size": 123,
    "duration": 5,
    "pages": 1,
    "image_downloaded": true,
    "fax_status": "STORED",
    "direction": "OUTBOUND",
    "completed_timestamp": "2024-11-14T15:37:22+00:00",
    "originating_fax_number": "+12345678910",
    "destination_fax_number": "+12345678910"
  }
]`
    )
  },
  {
    id: "faxes-create",
    title: "/faxes",
    method: "POST",
    path: "/opc/v1/faxes",
    url: `${BASE_URL}/opc/v1/faxes`,
    description:
      "Sends fax transmissions with destination details, fax options, client data, and document content. A successful request returns a fax ID and destination fax number.",
    headers: standardHeaders,
    bodyParams: [
      ["destinations", "array", "Destination numbers and recipient metadata for the fax."],
      ["fax_options", "object", "Options such as resolution, cover page, retry settings, CSID, and caller ID."],
      ["client_data", "object", "Client tracking and billing data."],
      ["documents", "array", "Fax document content and document type."]
    ],
    body: `{
  "destinations": [
    {
      "to_name": "To name",
      "to_company": "To company",
      "fax_number": "+12345678910"
    }
  ],
  "fax_options": {
    "image_resolution": "STANDARD",
    "include_cover_page": true,
    "cover_page_options": {
      "from_name": "",
      "subject": "",
      "message": "Aizan Docs"
    }
  },
  "client_data": {
    "client_code": "clien_code_1",
    "client_id": "aizan_manual_test"
  },
  "documents": [
    {
      "document_type": "PDF",
      "document_content": "JVBERi0xLjU..."
    }
  ]
}`,
    responses: standardResponses(
      "200",
      `[
  {
    "fax_id": "ec048b91-3589-489b-8e95-a067e50d92a8",
    "destination_fax_number": "+12345678910"
  }
]`,
      [{ code: "400", label: "Object", body: commonError }]
    ),
    attributes: [
      ["fax_id", "string", "Unique fax identifier returned for the submitted fax."],
      ["destination_fax_number", "string", "Destination fax number accepted for the request."]
    ]
  },
  {
    id: "fax-metadata-get",
    title: "/faxes/{fax_id}/metadata",
    method: "GET",
    path: "/opc/v1/faxes/{fax_id}/metadata",
    url: `${BASE_URL}/opc/v1/faxes/{fax_id}/metadata`,
    globoff: true,
    description:
      "Retrieves detailed metadata for a single fax transmission, including size, duration, pages, status, routing data, and transmission data.",
    headers: standardHeaders,
    pathParams: [["fax_id", "string", "The unique identifier of the fax."]],
    responses: standardResponses(
      "200",
      `{
  "fax_id": "ec048b91-3589-489b-8e95-a067e50d92a8",
  "size": 123,
  "duration": 5,
  "pages": 1,
  "image_downloaded": true,
  "fax_status": "STORED",
  "completed_timestamp": "2024-11-14T15:37:22+00:00",
  "direction": "OUTBOUND",
  "originating_fax_number": "+12345678910",
  "destination_fax_number": "+12345678910",
  "transmission_data": {
    "transmission_status": "COMPLETE",
    "billable_retries": null,
    "error_code": "",
    "error_message": ""
  }
}`
    )
  },
  {
    id: "fax-metadata-patch",
    title: "/faxes/{fax_id}/metadata",
    method: "PATCH",
    path: "/opc/v1/faxes/{fax_id}/metadata",
    url: `${BASE_URL}/opc/v1/faxes/{fax_id}/metadata`,
    globoff: true,
    description:
      "Updates limited metadata for a single fax image. The available editable field shown in the source documentation is image_downloaded.",
    headers: [...standardHeaders, ["Content-Type", "string", "application/json"]],
    pathParams: [["fax_id", "string", "The unique identifier of the fax."]],
    bodyParams: [["image_downloaded", "boolean", "Indicates whether the fax image has been downloaded."]],
    body: `{
  "image_downloaded": false
}`,
    responses: standardResponses(
      "200",
      `{
  "fax_id": "ec048b91-3589-489b-8e95-a067e50d92a8",
  "size": 123,
  "duration": 5,
  "pages": 1,
  "image_downloaded": true,
  "fax_status": "STORED",
  "completed_timestamp": "2024-11-14T15:37:22+00:00",
  "direction": "OUTBOUND"
}`
    )
  },
  {
    id: "fax-image",
    title: "/faxes/{fax_id}/image",
    method: "GET",
    path: "/opc/v1/faxes/{fax_id}/image",
    displayPath: "/opc/v1/faxes/{fax_id}/image?desired_format=PDF",
    url: `${BASE_URL}/opc/v1/faxes/{fax_id}/image?desired_format=PDF`,
    globoff: true,
    description:
      "Retrieves the image associated with a specific fax ID and returns image metadata such as file name and image content.",
    headers: standardHeaders,
    queryParams: [["desired_format", "string", "Requested image format, such as PDF."]],
    pathParams: [["fax_id", "string", "The unique identifier of the fax image to retrieve."]],
    responses: standardResponses(
      "200",
      `{
  "fax_id": "ec048b91-3589-489b-8e95-a067e50d92a8",
  "file_name": "ec048b91-3589-489b-8e95-a067e50d92a8.pdf",
  "image": "JVBERi0xLjQKJeLjz9MKMSAwIG9iago..."
}`,
      [{ code: "404", label: "Object", body: imageNotFound }]
    )
  },
  {
    id: "fax-image-pages",
    title: "/faxes/{fax_id}/image/pages",
    method: "GET",
    path: "/opc/v1/faxes/{fax_id}/image/pages",
    displayPath: "/opc/v1/faxes/{fax_id}/image/pages?start_page=0&num_pages=2",
    url: `${BASE_URL}/opc/v1/faxes/{fax_id}/image/pages?start_page=0&num_pages=2`,
    globoff: true,
    description:
      "Retrieves specific pages from a fax image by fax ID, start page, and number of pages.",
    headers: standardHeaders,
    queryParams: [
      ["start_page", "string", "Starting page number for image page retrieval."],
      ["num_pages", "string", "Number of pages to return."]
    ],
    pathParams: [["fax_id", "string", "The unique identifier of the fax."]],
    responses: standardResponses(
      "200",
      `{
  "fax_id": "ec048b91-3589-489b-8e95-a067e50d92a8",
  "pages": [
    {
      "page_number": null,
      "file_name": "ec048b91-3589-489b-8e95-a067e50d92a8-P-0.tiff",
      "image": "SUkqAOo4AQAAE1AyhuACagZQ3A..."
    }
  ]
}`,
      [{ code: "404", label: "Object", body: imageNotFound }]
    )
  },
  {
    id: "fax-delete",
    title: "/faxes/{fax_id}",
    method: "DELETE",
    path: "/opc/v1/faxes/{fax_id}",
    url: `${BASE_URL}/opc/v1/faxes/{fax_id}`,
    globoff: true,
    description: "Deletes a specific fax by fax ID.",
    headers: standardHeaders,
    pathParams: [["fax_id", "string", "The unique identifier of the fax."]],
    responses: [
      { code: "204", label: "Object", body: "" },
      { code: "401", label: "Object", body: commonUnauthorized },
      { code: "404", label: "Object", body: commonError },
      { code: "429", label: "Object", body: common429 },
      { code: "500", label: "Object", body: commonError }
    ]
  },
  {
    id: "fax-cancel",
    title: "/faxes/{fax_id}/cancel",
    method: "POST",
    path: "/opc/v1/faxes/{fax_id}/cancel",
    url: `${BASE_URL}/opc/v1/faxes/{fax_id}/cancel`,
    globoff: true,
    description: "Cancels a specific fax by fax ID.",
    headers: standardHeaders,
    pathParams: [["fax_id", "string", "The unique identifier of the fax."]],
    responses: [
      { code: "202", label: "Object", body: "ACCEPTED" },
      { code: "401", label: "Object", body: commonUnauthorized },
      { code: "404", label: "Object", body: commonError },
      { code: "429", label: "Object", body: common429 },
      { code: "500", label: "Object", body: commonError }
    ]
  },
  {
    id: "fax-transmission-details",
    title: "/faxes/{fax_id}/transmission-details",
    method: "GET",
    path: "/opc/v1/faxes/{fax_id}/transmission-details",
    url: `${BASE_URL}/opc/v1/faxes/{fax_id}/transmission-details`,
    globoff: true,
    description:
      "Retrieves detailed transmission information for a specific fax, including status, timestamps, retry counts, error codes, and attempts.",
    headers: standardHeaders,
    pathParams: [["fax_id", "string", "The unique identifier of the fax."]],
    responses: standardResponses(
      "200",
      `{
  "fax_id": "ec048b91-3589-489b-8e95-a067e50d92a8",
  "direction": "OUTBOUND",
  "originating_fax_number": "+12345678910",
  "destination_fax_number": "+12345678910",
  "transmission_data": {
    "transmission_status": "COMPLETED",
    "completed_timestamp": "2024-11-14T15:37:22+00:00",
    "error_code": "0",
    "error_message": "OK",
    "total_pages_sent": 1,
    "total_duration": 5
  },
  "attempts": [
    {
      "attempt_number": 1,
      "attempt_status": "COMPLETED",
      "duration": 5
    }
  ]
}`
    )
  },
  {
    id: "application-notifications-get",
    title: "/applications/{application-id}/notifications",
    method: "GET",
    path: "/opc/v1/applications/{application-id}/notifications",
    url: `${BASE_URL}/opc/v1/applications/{application-id}/notifications`,
    globoff: true,
    description: "Retrieves notifications associated with a specific application.",
    headers: [
      ["Authorization", "string REQUIRED", "The authorization token for accessing the API."],
      ["user_id", "string REQUIRED", "The admin user associated with the application."],
      ["transaction-id", "string", "The identifier for the transaction related to the notification."]
    ],
    pathParams: [["application-id", "string", "The unique identifier for the application."]],
    responses: standardResponses(
      "200",
      `[
  {
    "notification_id": "01JFAF5SBJ....",
    "app_id": "bbrrqp3ecc...",
    "direction": "OUTBOUND",
    "notify_destination": "https://some.url",
    "enabled": true
  }
]`
    )
  },
  {
    id: "application-notifications-post",
    title: "/applications/{application-id}/notifications",
    method: "POST",
    path: "/opc/v1/applications/{application-id}/notifications",
    url: `${BASE_URL}/opc/v1/applications/{application-id}/notifications`,
    globoff: true,
    description:
      "Creates a notification for a specific application with direction, type, destination, and HMAC secret.",
    headers: [
      ["user_id", "string REQUIRED", "The admin user responsible for the notification."],
      ["Authorization", "string REQUIRED", "The authorization token for accessing the API."],
      ["transaction-id", "string", "The unique identifier for the transaction associated with the notification."]
    ],
    pathParams: [["application-id", "string", "The unique identifier for the application."]],
    bodyParams: [
      ["direction", "string", "Direction of the notification, such as INBOUND or OUTBOUND."],
      ["type", "string", "Notification type, such as WEBHOOK."],
      ["notify_destination", "string", "Destination where the notification will be sent."],
      ["hmac_secret", "string", "Secret key used for HMAC message integrity verification."]
    ],
    body: `{
  "direction": "INBOUND",
  "type": "WEBHOOK",
  "notify_destination": "http://some.url",
  "hmac_secret": "123"
}`,
    responses: standardResponses("201", "CREATED")
  },
  {
    id: "application-notification-delete",
    title: "/applications/{application-id}/notifications/{notification-id}",
    method: "DELETE",
    path: "/opc/v1/applications/{application-id}/notifications/{notification-id}",
    url: `${BASE_URL}/opc/v1/applications/APP_ID/notifications/NOTIFICATION_ID`,
    description: "Deletes a specific notification associated with an application.",
    headers: [
      ["Authorization", "string REQUIRED", "The authorization token for accessing the API."],
      ["user_id", "string REQUIRED", "The admin user making the request."],
      ["transaction-id", "string", "The transaction identifier associated with the deletion request."]
    ],
    pathParams: [
      ["application-id", "string", "The unique identifier of the application."],
      ["notification-id", "string", "The unique identifier of the notification to delete."]
    ],
    responses: [
      { code: "204", label: "Object", body: "" },
      { code: "401", label: "Object", body: commonUnauthorized },
      { code: "429", label: "Object", body: common429 },
      { code: "500", label: "Object", body: commonError }
    ]
  },
  {
    id: "application-notification-patch",
    title: "/applications/{application-id}/notifications/{notification-id}",
    method: "PATCH",
    path: "/opc/v1/applications/{application-id}/notifications/{notification-id}",
    url: `${BASE_URL}/opc/v1/applications/APP_ID/notifications/NOTIFICATION_ID`,
    description: "Updates a specific notification associated with an application.",
    headers: [
      ["Authorization", "string REQUIRED", "The authorization token for accessing the API."],
      ["user_id", "string REQUIRED", "The admin user making the request."],
      ["transaction-id", "string", "The unique identifier of the transaction associated with the notification."]
    ],
    pathParams: [
      ["application-id", "string", "The unique identifier of the application."],
      ["notification-id", "string", "The unique identifier of the notification to update."]
    ],
    bodyParams: [
      ["notify_destination", "string", "Destination to notify when the action is triggered."],
      ["hmac_secret", "string", "Secret key used for HMAC secure communication."]
    ],
    body: `{
  "notify_destination": "http://some.url",
  "hmac_secret": "123"
}`,
    responses: standardResponses("200", "OK")
  },
  {
    id: "notifications",
    title: "/notifications",
    method: "GET",
    path: "/opc/v1/notifications",
    displayPath: "/opc/v1/notifications?after=...&before=...&fax_direction=OUTBOUND&sent_status=SUCCESSFUL",
    url: `${BASE_URL}/opc/v1/notifications?after=2024-12-17T14%3A56%3A16.395012%2000%3A0&before=2024-12-17T14%3A56%3A16.395012%2000%3A0&fax_direction=OUTBOUND&sent_status=SUCCESSFUL`,
    description:
      "Retrieves notification transaction details, including timestamp, fax direction, destination, notification type, and sent status.",
    headers: [
      ["transaction_id", "string REQUIRED", "Unique identifier for a specific notification transaction."],
      ["Authorization", "string REQUIRED", "The authorization token for accessing the endpoint."],
      ["pagination-limit", "string", "Maximum number of notifications to return."],
      ["pagination-offset-id", "string", "Pagination offset identifier."]
    ],
    queryParams: [
      ["after", "string", "Filter notifications after the specified timestamp."],
      ["before", "string", "Filter notifications before the specified timestamp."],
      ["fax_direction", "string", "Direction of the fax notification."],
      ["sent_status", "string", "Delivery status filter."]
    ],
    responses: standardResponses(
      "200",
      `[
  {
    "app_id": "bbrrqp3...",
    "user_id": "8cede588-4091-708c-7de1-c22f65e3b31b",
    "fax_id": "04be03a4-56ff-40ad-91a1-968b3390b057",
    "notify_id": "277fd640-1625-48ad-8ed1-29f02a4e9fd2",
    "fax_direction": "OUTBOUND",
    "fax_completed_timestamp": "1984-01-01T14:56:16.395012+00:00",
    "notify_type": "WEBHOOK",
    "notify_destination": "https://some.url",
    "sent_status": "SUCCESSFUL"
  }
]`
    )
  },
  {
    id: "reports-usage",
    title: "/reports/usage",
    method: "GET",
    path: "/reports/usage",
    displayPath: "/reports/usage?endDate=&reportPeriod=&serviceType=&startDate=",
    url: `${BASE_URL}/reports/usage`,
    description:
      "Returns a list of usage reports according to report period, service type, start date, and end date, including download URLs for each report.",
    headers: adminHeaders,
    queryParams: [
      ["endDate", "string", "End date for the report data in YYYY-MM-DD format."],
      ["reportPeriod", "string", "Period for the report data, such as daily, weekly, or monthly."],
      ["serviceType", "string", "Type of service requested for the report."],
      ["startDate", "string", "Start date for the report data in YYYY-MM-DD format."]
    ],
    responses: [
      {
        code: "200",
        label: "Object",
        body: `{
  "send_reports": [
    {
      "start_date": "Aug 4, 2019",
      "end_date": "Aug 10, 2019",
      "url_csv": "https://www.efaxcorporate.com/mgmt/externalDownloadReport?reportKey=123456789&fileType=CSV",
      "url_excel": "https://www.efaxcorporate.com/mgmt/externalDownloadReport?reportKey=123456789&fileType=XLS"
    }
  ],
  "monthly_send_reports": [],
  "receive_reports": [],
  "monthly_receive_reports": []
}`
      },
      { code: "400", label: "Object", body: report400 },
      { code: "401", label: "Object", body: report401 },
      { code: "403", label: "Object", body: report403 },
      { code: "404", label: "Object", body: report404 },
      { code: "429", label: "Object", body: report429 },
      { code: "500", label: "Object", body: report500 }
    ]
  },
  {
    id: "reports-usage-download",
    title: "/reports/usage/download/{report-key}",
    method: "GET",
    path: "/reports/usage/download/{report-key}",
    displayPath: "/reports/usage/download/{report-key}?fileType={fileType}",
    url: `${BASE_URL}/reports/usage/download/{report-key}?fileType={fileType}`,
    globoff: true,
    description:
      "Downloads a usage report by report key and requested file type so users can analyze detailed usage data.",
    headers: adminHeaders,
    queryParams: [["fileType", "string", "Requested report file format, such as CSV or XLS."]],
    pathParams: [["report-key", "string", "The key identifying the report to download."]],
    responses: [
      { code: "200", label: "Object", body: "{}" },
      { code: "400", label: "Object", body: report400 },
      { code: "401", label: "Object", body: report401 },
      { code: "403", label: "Object", body: report403 },
      { code: "404", label: "Object", body: report404 },
      { code: "429", label: "Object", body: report429 },
      { code: "500", label: "Object", body: report500 }
    ]
  }
];

const languages = [
  { key: "curl", label: "cURL", curl: true },
  { key: "ruby", label: "Ruby", icon: "https://app.theneo.io/icons/icons8-ruby-programming-language.svg" },
  { key: "python", label: "Python", icon: "https://app.theneo.io/icons/icons8-python.svg" },
  { key: "php", label: "PHP", icon: "https://app.theneo.io/icons/icons8-php-logo.svg" },
  { key: "java", label: "Java", icon: "https://app.theneo.io/icons/icons8-java.svg" },
  { key: "node", label: "Node.js", icon: "https://app.theneo.io/icons/icons8-nodejs.svg" },
  { key: "go", label: "Go", icon: "https://app.theneo.io/icons/go-logo-blue.svg" },
  { key: "dotnet", label: ".NET", icon: "https://app.theneo.io/icons/microsoft-dot-net.webp" }
];

const escapeHtml = (value) =>
  String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

function formatParams(params = []) {
  return params
    .map(
      ([name, type, description]) => `<div>
        <code>${escapeHtml(name)}</code>
        <span>${escapeHtml(type)}</span>
        <p>${escapeHtml(description)}</p>
      </div>`
    )
    .join("");
}

function paramGroup(title, params) {
  if (!params?.length) return "";
  return `<h4>${title}</h4><div class="param-list">${formatParams(params)}</div>`;
}

function responseClass(code) {
  if (String(code).startsWith("2")) return "ok";
  if (String(code) === "429") return "warn";
  if (String(code).startsWith("5")) return "server";
  return "error";
}

function renderLanguageChoice(endpoint, language) {
  const visual = language.curl
    ? `<span class="curl-mark">curl://</span>`
    : `<img src="${language.icon}" alt="" />`;

  return `<button class="language-choice${language.key === "curl" ? " is-active" : ""}" type="button" data-language-tab="${endpoint.id}" data-language="${language.key}">
    ${visual}
    <span>${language.label}</span>
  </button>`;
}

function renderEndpoint(endpoint, index) {
  const activeResponse = endpoint.responses[0];
  const responseButtons = endpoint.responses
    .map(
      (response, responseIndex) =>
        `<button class="${responseIndex === 0 ? "is-active" : ""}" type="button" data-response-tab="${endpoint.id}" data-response-code="${response.code}">${response.code}</button>`
    )
    .join("");

  const responseList = endpoint.responses
    .map(
      (response) => `<article>
        <span class="status ${responseClass(response.code)}">${response.code}</span>
        <strong>${response.label}</strong>
        ${response.body && response.body.length < 90 ? `<p>${escapeHtml(response.body)}</p>` : ""}
      </article>`
    )
    .join("");

  const attributes = endpoint.attributes?.length
    ? `<h4>Response Attributes</h4><div class="param-list">${formatParams(endpoint.attributes)}</div>`
    : "";

  const pathText = endpoint.displayPath || endpoint.path;

  return `<section class="doc-section" id="${endpoint.id}">
    <div class="doc-copy">
      <h1>${escapeHtml(endpoint.title)}</h1>
      <p>${escapeHtml(endpoint.description)}</p>
      ${paramGroup("Header Parameters", endpoint.headers)}
      ${paramGroup("Query Parameters", endpoint.queryParams)}
      ${paramGroup("Path Parameters", endpoint.pathParams)}
      ${paramGroup("Body Parameters", endpoint.bodyParams)}
      <h3>Response</h3>
      <div class="response-list">${responseList}</div>
      ${attributes}
      <div class="feedback" aria-label="Section feedback">
        <span>Was this section helpful?</span>
        <button type="button">Yes</button>
        <button type="button">No</button>
      </div>
    </div>

    <aside class="example-stack" aria-label="${escapeHtml(endpoint.title)} examples">
      ${index === 0 ? `<div class="info-card">
        <div class="info-title">Base URL</div>
        <dl class="url-list">
          <div>
            <dt>Development:</dt>
            <dd>https://api.optiqare.com/</dd>
          </div>
        </dl>
      </div>` : ""}

      <div class="language-card" data-language-box="${endpoint.id}">
        <div class="card-title">Language Box</div>
        <div class="language-grid">${languages.map((language) => renderLanguageChoice(endpoint, language)).join("")}</div>
      </div>

      <div class="code-card endpoint-card" data-snippet="${endpoint.id}">
        <div class="endpoint-card-header">
          <div>
            <span class="method ${endpoint.method.toLowerCase()}">${endpoint.method}</span>
            <strong>${escapeHtml(pathText)}</strong>
          </div>
          <label>
            <span class="sr-only">Request language</span>
            <select data-language-select="${endpoint.id}" aria-label="Request language">
              ${languages.map((language) => `<option value="${language.key}">${language.label}</option>`).join("")}
            </select>
          </label>
          <button type="button" data-copy="${endpoint.id}-request">Copy</button>
        </div>
        <pre id="${endpoint.id}-request"><code>${escapeHtml(buildCurl(endpoint))}</code></pre>
      </div>

      <div class="code-card response-card">
        <div class="card-header">
          <span>Response</span>
          <button type="button" data-copy="${endpoint.id}-response">Copy</button>
        </div>
        <div class="response-tabs">${responseButtons}</div>
        <pre id="${endpoint.id}-response" data-response-output="${endpoint.id}"><code>${escapeHtml(activeResponse.body)}</code></pre>
      </div>
    </aside>
  </section>`;
}

function headerObject(endpoint) {
  const headers = {};
  endpoint.headers?.forEach(([name]) => {
    const key = name.toLowerCase();
    if (key === "authorization") headers[name] = name === "Authorization" && endpoint.id === "tokens" ? "Basic CLIENT_CREDENTIALS" : "ACCESS_TOKEN";
    else if (key.includes("content-type")) headers[name] = "application/json";
    else if (key.includes("pagination-limit")) headers[name] = "100";
    else if (key.includes("pagination-offset")) headers[name] = "0";
    else if (key.includes("transaction")) headers[name] = "TRANSACTION_ID";
    else if (key.includes("admin")) headers[name] = `{${name}}`;
    else if (key.includes("user")) headers[name] = "USER_ID";
  });
  return headers;
}

function buildCurl(endpoint) {
  const methodFlag = endpoint.method === "GET" ? "" : ` --request ${endpoint.method}`;
  const lines = [`curl --location${endpoint.globoff ? " --globoff" : ""}${methodFlag} '${endpoint.url}'`];
  Object.entries(headerObject(endpoint)).forEach(([name, value]) => {
    lines.push(`  --header '${name}: ${value}'`);
  });
  if (endpoint.body) {
    lines.push(`  --data '${endpoint.body}'`);
  }
  return lines.map((line, index) => (index === lines.length - 1 ? line : `${line} \\`)).join("\n");
}

function buildSnippet(endpoint, language) {
  const headers = JSON.stringify(headerObject(endpoint), null, 2);
  const body = endpoint.body || "";
  const method = endpoint.method;
  const url = endpoint.url;

  if (language === "curl") return buildCurl(endpoint);
  if (language === "ruby") return `require "net/http"
require "json"

uri = URI("${url}")
request = Net::HTTP::${method[0] + method.slice(1).toLowerCase()}.new(uri)
${Object.entries(headerObject(endpoint)).map(([name, value]) => `request["${name}"] = "${value}"`).join("\n")}
${body ? `request.body = ${JSON.stringify(body)}` : ""}

response = Net::HTTP.start(uri.hostname, uri.port, use_ssl: true) do |http|
  http.request(request)
end`;
  if (language === "python") return `import requests

response = requests.request(
    "${method}",
    "${url}",
    headers=${headers.replace(/\n/g, "\n    ")}${body ? `,\n    data=${JSON.stringify(body)}` : ""}
)`;
  if (language === "php") return `<?php
$ch = curl_init("${url}");
curl_setopt_array($ch, [
  CURLOPT_CUSTOMREQUEST => "${method}",
  CURLOPT_HTTPHEADER => ${JSON.stringify(Object.entries(headerObject(endpoint)).map(([name, value]) => `${name}: ${value}`), null, 2)},
  ${body ? `CURLOPT_POSTFIELDS => ${JSON.stringify(body)},` : ""}
  CURLOPT_RETURNTRANSFER => true
]);
$response = curl_exec($ch);`;
  if (language === "java") return `HttpRequest request = HttpRequest.newBuilder()
  .uri(URI.create("${url}"))
${Object.entries(headerObject(endpoint)).map(([name, value]) => `  .header("${name}", "${value}")`).join("\n")}
  .method("${method}", ${body ? `HttpRequest.BodyPublishers.ofString(${JSON.stringify(body)})` : "HttpRequest.BodyPublishers.noBody()"})
  .build();`;
  if (language === "node") return `const response = await fetch("${url}", {
  method: "${method}",
  headers: ${headers.replace(/\n/g, "\n  ")}${body ? `,\n  body: ${JSON.stringify(body)}` : ""}
});`;
  if (language === "go") return `payload := strings.NewReader(${JSON.stringify(body)})

req, _ := http.NewRequest("${method}", "${url}", ${body ? "payload" : "nil"})
${Object.entries(headerObject(endpoint)).map(([name, value]) => `req.Header.Add("${name}", "${value}")`).join("\n")}`;
  return `using var client = new HttpClient();
using var request = new HttpRequestMessage(HttpMethod.${method[0] + method.slice(1).toLowerCase()}, "${url}");
${Object.entries(headerObject(endpoint)).map(([name, value]) => `request.Headers.Add("${name}", "${value}");`).join("\n")}
${body ? `request.Content = new StringContent(${JSON.stringify(body)}, Encoding.UTF8, "application/json");` : ""}
using var response = await client.SendAsync(request);`;
}

function render() {
  const sectionsRoot = document.querySelector("#doc-sections");
  const nav = document.querySelector(".section-nav");

  sectionsRoot.innerHTML = endpoints.map(renderEndpoint).join("");
  nav.innerHTML = endpoints
    .map((endpoint) => `<a href="#${endpoint.id}"><span class="nav-method">${endpoint.method}</span>${escapeHtml(endpoint.title)}</a>`)
    .join("");
}

function setupThemeToggle() {
  const themeToggle = document.querySelector(".theme-toggle");
  const storedTheme = (() => {
    try {
      return localStorage.getItem("aizan-docs-theme");
    } catch {
      return null;
    }
  })();

  const applyTheme = (theme) => {
    const nextTheme = theme === "dark" ? "dark" : "light";
    document.documentElement.dataset.theme = nextTheme;
    themeToggle?.setAttribute("aria-pressed", String(nextTheme === "dark"));
    themeToggle?.setAttribute(
      "title",
      nextTheme === "dark" ? "Switch to light theme" : "Switch to dark theme"
    );

    try {
      localStorage.setItem("aizan-docs-theme", nextTheme);
    } catch {
      // Storage can be unavailable in some browser privacy modes.
    }
  };

  applyTheme(storedTheme === "dark" ? "dark" : "light");

  themeToggle?.addEventListener("click", () => {
    applyTheme(document.documentElement.dataset.theme === "dark" ? "light" : "dark");
  });
}

function renderUtilitySections() {
  const sectionsRoot = document.querySelector("#doc-sections");
  if (!sectionsRoot || document.getElementById("api-explorer")) return;

  const cards = endpoints
    .map((endpoint) => {
      const pathText = endpoint.displayPath || endpoint.path;
      return `<a class="explorer-card" href="#${endpoint.id}">
        <span>${escapeHtml(endpoint.method)}</span>
        <strong>${escapeHtml(endpoint.title)}</strong>
        <p>${escapeHtml(pathText)}</p>
      </a>`;
    })
    .join("");

  sectionsRoot.insertAdjacentHTML(
    "beforeend",
    `<section class="utility-section" id="api-explorer">
      <h1>API Explorer</h1>
      <p>Use this compact endpoint index to jump directly into the Mainstay Fax API sections.</p>
      <div class="explorer-grid">${cards}</div>
    </section>
    <section class="utility-section" id="changelog">
      <h1>Changelog</h1>
      <ol class="changelog-list">
        <li><strong>Current GitHub Pages build</strong><span>Search filters endpoints, API Explorer links to each endpoint, and the light/dark theme toggle is active.</span></li>
        <li><strong>Fax API migration</strong><span>Recreated the Mainstay Fax endpoint documentation as a static GitHub Pages site with language examples and response-code tabs.</span></li>
      </ol>
    </section>`
  );
}

render();
renderUtilitySections();
setupThemeToggle();

const navLinks = Array.from(document.querySelectorAll(".section-nav a"));
const sections = navLinks
  .map((link) => document.querySelector(link.getAttribute("href")))
  .filter(Boolean);
const searchInput = document.querySelector("#section-search");
const searchStatus = document.querySelector("#search-status");
const endpointSearchIndex = endpoints.map((endpoint) => ({
  id: endpoint.id,
  text: [
    endpoint.method,
    endpoint.title,
    endpoint.path,
    endpoint.displayPath,
    endpoint.url,
    endpoint.description,
    ...(endpoint.headers || []).flat(),
    ...(endpoint.queryParams || []).flat(),
    ...(endpoint.pathParams || []).flat(),
    ...(endpoint.bodyParams || []).flat(),
    ...(endpoint.attributes || []).flat(),
    ...endpoint.responses.map((response) => `${response.code} ${response.label} ${response.body}`)
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase()
}));
let activeSearchTarget = "";

function setActiveNav(id) {
  navLinks.forEach((link) => {
    link.classList.toggle("is-active", link.getAttribute("href") === `#${id}`);
  });
}

function updateSearch(query) {
  const normalizedQuery = query.trim().toLowerCase();

  if (!normalizedQuery) {
    navLinks.forEach((link) => link.classList.remove("is-search-hidden"));
    sections.forEach((section) => section.classList.remove("is-search-hidden"));
    searchStatus?.classList.remove("is-visible");
    if (searchStatus) searchStatus.textContent = "";
    activeSearchTarget = "";
    return;
  }

  const matches = endpointSearchIndex.filter((endpoint) => endpoint.text.includes(normalizedQuery));
  const matchingIds = new Set(matches.map((endpoint) => endpoint.id));

  navLinks.forEach((link) => {
    const id = link.getAttribute("href")?.slice(1);
    link.classList.toggle("is-search-hidden", !matchingIds.has(id));
  });

  sections.forEach((section) => {
    section.classList.toggle("is-search-hidden", !matchingIds.has(section.id));
  });

  if (searchStatus) {
    const resultLabel = matches.length === 1 ? "result" : "results";
    searchStatus.textContent = matches.length
      ? `${matches.length} ${resultLabel} for "${query.trim()}".`
      : `No endpoints found for "${query.trim()}".`;
    searchStatus.classList.add("is-visible");
  }

  if (!matches.length) {
    activeSearchTarget = "";
    return;
  }

  const firstMatch = matches[0].id;
  setActiveNav(firstMatch);

  if (activeSearchTarget === firstMatch) return;

  activeSearchTarget = firstMatch;
  document.getElementById(firstMatch)?.scrollIntoView({ block: "start" });
  history.replaceState(null, "", `#${firstMatch}`);
}

if (sections.length > 0) {
  const observer = new IntersectionObserver(
    (entries) => {
      const visible = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

      if (!visible) return;

      setActiveNav(visible.target.id);
    },
    {
      rootMargin: "-20% 0px -60% 0px",
      threshold: [0.1, 0.25, 0.5]
    }
  );

  sections.forEach((section) => observer.observe(section));
}

searchInput?.addEventListener("input", (event) => {
  updateSearch(event.target.value);
});

document.querySelector('a[href="#search"]')?.addEventListener("click", (event) => {
  event.preventDefault();
  searchInput?.focus();
});

document.addEventListener("keydown", (event) => {
  if (event.key !== "/" || event.metaKey || event.ctrlKey || event.altKey) return;

  const activeTag = document.activeElement?.tagName;
  if (activeTag === "INPUT" || activeTag === "TEXTAREA" || activeTag === "SELECT") return;

  event.preventDefault();
  searchInput?.focus();
});

document.querySelectorAll("[data-copy]").forEach((button) => {
  button.addEventListener("click", async () => {
    const target = document.getElementById(button.dataset.copy);
    if (!target) return;

    const originalLabel = button.textContent;

    try {
      await navigator.clipboard.writeText(target.textContent);
      button.textContent = "Copied";
      window.setTimeout(() => {
        button.textContent = originalLabel;
      }, 1100);
    } catch {
      const range = document.createRange();
      range.selectNodeContents(target);
      const selection = window.getSelection();
      selection.removeAllRanges();
      selection.addRange(range);
    }
  });
});

function setLanguage(snippetKey, language) {
  const endpoint = endpoints.find((item) => item.id === snippetKey);
  const pre = document.querySelector(`[data-snippet="${snippetKey}"] pre`);
  const select = document.querySelector(`[data-language-select="${snippetKey}"]`);

  if (!endpoint || !pre) return;

  pre.textContent = buildSnippet(endpoint, language);

  if (select) select.value = language;

  document.querySelectorAll(`[data-language-tab="${snippetKey}"]`).forEach((button) => {
    button.classList.toggle("is-active", button.dataset.language === language);
  });
}

document.querySelectorAll("[data-language-select]").forEach((select) => {
  select.addEventListener("change", () => {
    setLanguage(select.dataset.languageSelect, select.value);
  });
});

document.querySelectorAll("[data-language-tab]").forEach((button) => {
  button.addEventListener("click", () => {
    setLanguage(button.dataset.languageTab, button.dataset.language);
  });
});

function setResponseCode(responseKey, code) {
  const endpoint = endpoints.find((item) => item.id === responseKey);
  const snippet = endpoint?.responses.find((response) => response.code === code)?.body;
  const output = document.querySelector(`[data-response-output="${responseKey}"]`);

  if (snippet === undefined || !output) return;

  output.textContent = snippet;

  document.querySelectorAll(`[data-response-tab="${responseKey}"]`).forEach((button) => {
    button.classList.toggle("is-active", button.dataset.responseCode === String(code));
  });
}

document.querySelectorAll("[data-response-tab]").forEach((button) => {
  button.addEventListener("click", () => {
    setResponseCode(button.dataset.responseTab, button.dataset.responseCode);
  });
});

endpoints.forEach((endpoint) => {
  setLanguage(endpoint.id, "curl");
  setResponseCode(endpoint.id, endpoint.responses[0].code);
});
