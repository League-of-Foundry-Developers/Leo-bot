SELECT 
	user,
	name,
	discriminator,
	name || "#" || discriminator AS tag,
	score,
	latest,
	initial,
	rank() OVER (
		ORDER BY 
			score DESC,
			latest DESC
	) AS rank 
FROM (
	SELECT
		user,
		SUM(delta) AS score,
		MAX(Reputation.updatedAt) AS latest,
		MIN(Reputation.createdAt) AS initial
	FROM
		Reputation
	GROUP BY user
)
INNER JOIN Users ON user = Users.id;