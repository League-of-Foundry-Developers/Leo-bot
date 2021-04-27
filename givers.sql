SELECT 
	name || "#" || discriminator AS tag,
	given,
	rank() OVER (
		ORDER BY given DESC
	) AS rank
FROM (
	SELECT
		giverId,
		SUM(delta) AS given
	FROM
		Reputation
	WHERE delta < 100 AND delta > -100
	GROUP BY giverId
)
INNER JOIN Users ON giverId = Users.id;