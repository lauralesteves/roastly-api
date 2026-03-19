package controllers

import (
	"encoding/json"
	"net/http"

	"github.com/aws/aws-lambda-go/events"
)

func SuccessResponse(output interface{}, statusCode int) events.APIGatewayProxyResponse {
	responseBody, _ := json.Marshal(output)
	return events.APIGatewayProxyResponse{
		StatusCode: statusCode,
		Body:       string(responseBody),
		Headers:    map[string]string{"Content-Type": "application/json"},
	}
}

func NotFoundResponse(entity string) events.APIGatewayProxyResponse {
	return events.APIGatewayProxyResponse{
		StatusCode: http.StatusNotFound,
		Body:       `{"error":"` + entity + ` not found"}`,
		Headers:    map[string]string{"Content-Type": "application/json"},
	}
}

func BadRequestResponse(err error) events.APIGatewayProxyResponse {
	msg := "bad request"
	if err != nil {
		msg = err.Error()
	}
	return events.APIGatewayProxyResponse{
		StatusCode: http.StatusBadRequest,
		Body:       `{"error":"` + msg + `"}`,
		Headers:    map[string]string{"Content-Type": "application/json"},
	}
}

func InternalServerErrorResponse() events.APIGatewayProxyResponse {
	return events.APIGatewayProxyResponse{
		StatusCode: http.StatusInternalServerError,
		Body:       `{"error":"internal server error"}`,
		Headers:    map[string]string{"Content-Type": "application/json"},
	}
}
