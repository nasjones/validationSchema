process.env.NODE_ENV = "test";

const request = require("supertest");
const app = require("../app");
const db = require("../db");
const Books = require("../models/book");

let bookOne, bookTwo, bookThree;

beforeEach(async function () {
	bookOne = await Books.create({
		isbn: "0691161518",
		amazon_url: "http://a.co/eobPtX2",
		author: "Matthew Lane",
		language: "english",
		pages: 264,
		publisher: "Princeton University Press",
		title: "Power-Up: Unlocking Hidden Math in Video Games",
		year: 2017,
	});

	bookTwo = {
		isbn: "37485937852",
		amazon_url: "fakebook.com",
		author: "clark zuckerberg",
		language: "english",
		pages: 10,
		publisher: "Fake Press",
		title: "Fakest Book",
		year: 2019,
	};

	bookThree = {
		isbn: "0691161518",
		amazon_url: "http://a.co/eobPtX2",
		language: "english",
		pages: 2,
		publisher: "Tester press",
		title: "Validate me",
	};
});

describe("GET /books", function () {
	test("Gets books in database", async function () {
		const response = await request(app).get(`/books`);
		expect(response.statusCode).toEqual(200);
		expect(response.body).toEqual({
			books: [bookOne],
		});
	});
});

describe("GET /books/:isbn", function () {
	test("Get book by id from database", async function () {
		const response = await request(app).get(`/books/0691161518`);
		expect(response.statusCode).toEqual(200);
		expect(response.body).toEqual({ book: bookOne });
	});

	test("Get non existant book should return error", async function () {
		const response = await request(app).get(`/books/3`);
		expect(response.statusCode).toEqual(404);
		expect(response.body).toEqual({
			error: { message: "There is no book with an isbn '3", status: 404 },
			message: "There is no book with an isbn '3",
		});
	});
});

describe("POST /books", function () {
	test("Post book to database", async function () {
		const response = await request(app).post(`/books`).send(bookTwo);
		expect(response.statusCode).toEqual(201);
		expect(response.body).toEqual({ book: bookTwo });
	});

	test("Post incomplete book to database", async function () {
		const response = await request(app).post(`/books`).send(bookThree);
		expect(response.statusCode).toEqual(400);
		expect(response.body).toEqual({
			error: {
				message: [
					'instance requires property "author"',
					'instance requires property "year"',
				],
				status: 400,
			},
			message: [
				'instance requires property "author"',
				'instance requires property "year"',
			],
		});
	});
});

describe("PUT /books/:isbn", function () {
	test("Update book in database", async function () {
		const response = await request(app)
			.put(`/books/0691161518`)
			.send({ ...bookOne, title: "New Title" });
		expect(response.statusCode).toEqual(200);
		expect(response.body).toEqual({
			book: { ...bookOne, title: "New Title" },
		});
	});
});

describe("DELETE /books/:isbn", function () {
	test("Delte book from database", async function () {
		const response = await request(app).delete(`/books/0691161518`);
		expect(response.statusCode).toEqual(200);
		expect(response.body).toEqual({
			message: "Book deleted",
		});
	});
});

afterEach(async function () {
	await db.query("DELETE FROM books");
});

afterAll(async function () {
	await db.end();
});
